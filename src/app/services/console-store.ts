import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Role, Tab, TAB_ROLE, HEADERS, RECICLADOR_TABS, GENERADOR_TABS, TAB_LABELS } from '../model/account.model';
import { MATERIALS, MAT_ORDER, MAP_MATERIALS } from '../model/material.model';
import { POINT_TYPES, POINT_TYPE_KEYS, RECYCLING_POINTS, PointTypeKey } from '../model/point.model';
import { ADS, ROUTE_ORIGIN, ROUTE_LOCATIONS, RouteLocation, SavedRoute, SAVED_ROUTES } from '../model/ad.model';
import { Delivery, NewPub, PICKUPS, PUBLICATIONS, RowUpdate, TIME_SLOTS, rowRole } from '../model/delivery.model';
import { CONVOS, Message, THREADS } from '../model/chat.model';
import { DOCUMENTS, DOC_TYPES, PAY_KINDS, PAY_METHODS, PROFILE_DEFAULT, Profile, VerificationDoc, PayMethod } from '../model/profile.model';
import { FAQ_DATA, PAY_OPTIONS, REPORT_CATEGORIES, SUGGEST_RULES, TICKETS, TICKET_STATES, Ticket } from '../model/support.model';
import { AppNotification, DEFAULT_READ, NOTIFICATIONS, NOTIF_IDS } from '../model/notification.model';
import { ICONS } from '../model/icons';
import { AuthService } from './auth.service';

// ---- Utilidades (espejo de referencia-html/index.html) ----
const normalizeSearch = (t: string): string =>
  String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const todayDate = (): string => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
};
const shortDate = (): string => {
  const d = new Date();
  return [String(d.getDate()).padStart(2, '0'), String(d.getMonth() + 1).padStart(2, '0'), d.getFullYear()].join('/');
};
const validDate = (v: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(v || '') && !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;

const locOf = (id: string): RouteLocation | undefined => ROUTE_LOCATIONS.find((p) => p.id === id);
const validStops = (ids: string[]): string[] => [...new Set(ids)].filter((id) => ROUTE_LOCATIONS.some((p) => p.id === id));
// 1 unidad del dibujo = 80 m, velocidad media 15 km/h y 3 min por parada.
const legDistance = (a: { x: number; y: number }, b: { x: number; y: number }): number =>
  Math.hypot(a.x - b.x, a.y - b.y) * 0.08;

interface RouteStats {
  stops: RouteLocation[];
  kg: string;
  distance: number;
  distanceLabel: string;
  minutes: number;
}
const routeStats = (ids: string[]): RouteStats => {
  let previous: { x: number; y: number } = ROUTE_ORIGIN;
  let distance = 0;
  let kg = 0;
  const stops = validStops(ids).map((id) => locOf(id)!);
  stops.forEach((p) => { distance += legDistance(previous, p); kg += p.kg; previous = p; });
  return {
    stops,
    kg: kg.toLocaleString('es-PE') + ' kg',
    distance,
    distanceLabel: distance.toFixed(1).replace('.', ',') + ' km',
    minutes: Math.ceil((distance / 15) * 60 + stops.length * 3),
  };
};
const optimizeStops = (ids: string[]): string[] => {
  const remaining = validStops(ids);
  const ordered: string[] = [];
  let previous: { x: number; y: number } = ROUTE_ORIGIN;
  while (remaining.length) {
    remaining.sort((a, b) => legDistance(previous, locOf(a)!) - legDistance(previous, locOf(b)!) || a.localeCompare(b));
    const id = remaining.shift()!;
    ordered.push(id);
    previous = locOf(id)!;
  }
  return routeStats(ordered).distance <= routeStats(ids).distance ? ordered : validStops(ids);
};
const pubRecord = (p: NewPub): Delivery => ({
  id: p.id, thread: 't3', address: 'Av. Pershing 345, Magdalena', kg: p.kg,
  material: p.mats.map((k) => MATERIALS[k].label).join(', '),
  posted: 'Publicado ahora · ' + p.pay, person: 'Sin reclamar', personFg: '#8b9186',
  window: p.window, state: 'Esperando', stateBg: '#fdf3dd', stateFg: '#8a6a1f',
});

// Ciclo de vida del recojo (US 41-EP2, simulado): Creada → Coordinada → En camino
// → Completado, con Reprogramado/Cancelado como estados derivados. Reclamar un
// anuncio deja el recojo en «Creada»; coordinar día y franja lo pasa a
// «Coordinada»; iniciar el recorrido lo pone «En camino».
const SCANNABLE_STATES = ['Coordinada', 'En camino'] as const;
const STATE_STYLE: Record<string, readonly [string, string]> = {
  Creada: ['#fdf3dd', '#8a6a1f'],
  Coordinada: ['#eceee7', '#5d6b5f'],
  'En camino': ['#eef2e4', '#3f6224'],
  Completado: ['#eef2e4', '#3f6224'],
  Reprogramado: ['#fdf3dd', '#8a6a1f'],
  Cancelado: ['#f7e9e4', '#b1573f'],
};

export interface DeliveryRow extends Delivery {
  rowBg: string;
  menuOpen: boolean;
  locked: boolean;
  lockHint: string;
  priorityLabel: string;
  canTrack: boolean;
  canScan: boolean;
  canCoordinate: boolean;
  canStartRoute: boolean;
}

/**
 * Estado SIMULADO de la consola. Equivale a la clase Component del prototipo:
 * signals para el estado que cambia al hacer clic, computed para los valores
 * derivados que interpolan las plantillas, y métodos para las acciones. Sin
 * backend ni persistencia: todo vive en memoria y se reinicia al recargar.
 */
@Injectable({ providedIn: 'root' })
export class ConsoleStore {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  // ---- Navegación / rol
  readonly role = signal<Role>('reciclador');
  readonly activeTab = signal<Tab>('mapa');
  readonly isGen = computed(() => this.role() === 'generador');

  // ---- Mapa
  readonly mapView = signal<'anuncios' | 'puntos'>('anuncios');
  readonly search = signal('');
  readonly mapMaterial = signal('');
  readonly pointType = signal('');
  readonly hiddenTypes = signal<string[]>([]);
  readonly selectedPoint = signal<string | null>(null);
  readonly filters = signal<Record<string, boolean>>({});

  // ---- Ruta / flujo
  readonly routeIds = signal<string[]>(['a1', 'a2']);
  readonly optimized = signal(false);
  readonly loadedRoute = signal('');
  readonly savedPanel = signal(false);
  readonly savedRoutesState = signal<SavedRoute[]>(SAVED_ROUTES.map((r) => ({ ...r, stops: r.stops.slice() })));
  private nextRouteId = 1;
  readonly claimed = signal<Record<string, boolean>>({ a1: true, a2: true });
  readonly routeNotice = signal('');

  // ---- Entregas
  readonly rowUpdates = signal<Record<string, RowUpdate>>({});
  readonly menuRow = signal<string | null>(null);
  readonly dialog = signal<'' | 'guardar' | 'reprogramar' | 'coordinar' | 'cancelar' | 'qr'>('');
  readonly actionRow = signal<string | null>(null);
  readonly newPubs = signal<NewPub[]>([]);
  readonly scheduleDate = signal('');
  readonly scheduleSlot = signal<string>(TIME_SLOTS[0]);
  readonly reason = signal('');
  readonly manualCode = signal('');
  readonly formError = signal('');
  readonly routeName = signal('');
  readonly routeDescription = signal('');

  // ---- Seguimiento / valoración
  readonly tracking = signal<string | null>(null);
  readonly trackingStart = signal(0);
  readonly rateOpen = signal(false);
  readonly rating = signal(0);
  readonly confirmedRow = signal<string | null>(null);

  // ---- Chats
  readonly thread = signal('t1');
  readonly chatRow = signal<string | null>(null);
  readonly draft = signal('');
  readonly extra = signal<Record<string, Message[]>>({});

  // ---- Publicar
  readonly materials = signal<Record<string, boolean>>({ carton: true });
  readonly qty = signal('24');
  readonly pubDay = signal('');
  readonly pubTime = signal('');
  readonly pubPay = signal<string>('Sin pago');
  readonly note = signal('');
  readonly photo = signal('');
  readonly photoName = signal('');
  readonly pubErrors = signal<Record<string, string>>({});
  readonly dismissedSuggestion = signal('');

  // ---- Perfil
  readonly profile = signal<Profile>({ ...PROFILE_DEFAULT, mats: PROFILE_DEFAULT.mats.slice() });
  readonly editProfile = signal(false);
  readonly profileForm = signal<Profile | null>(null);
  readonly profileErrors = signal<Record<string, string>>({});
  // Disponibilidad / visibilidad del perfil (US 28-EP4, simulado).
  readonly available = signal(true);

  // ---- Documentos
  readonly docsOpen = signal(false);
  readonly uploadedDocs = signal<VerificationDoc[]>([]);
  readonly docType = signal<string>('DNI');
  readonly docFile = signal<string | null>(null);
  readonly docError = signal('');

  // ---- Pagos
  readonly payOpen = signal(false);
  readonly extraMethods = signal<PayMethod[]>([]);
  readonly payDefault = signal('m1');
  readonly payKind = signal('yape');
  readonly payDetail = signal('');
  readonly payAsDefault = signal(true);
  readonly payError = signal('');

  // ---- Soporte
  readonly reportCategory = signal<string>('Incumplimiento');
  readonly reportText = signal('');
  readonly reportFile = signal('');
  readonly reportError = signal('');
  readonly reportNotice = signal('');
  readonly newTickets = signal<Ticket[]>([]);
  readonly faqOpen = signal<Record<number, boolean>>({ 0: true });

  // ---- Notificaciones
  readonly notifOpen = signal(false);
  readonly readIds = signal<string[]>([...DEFAULT_READ]);

  // =====================================================================
  //  Navegación y rol
  // =====================================================================
  /** Sincroniza el rol con la sesión del acceso (lo llama la consola al entrar). */
  syncRoleFromSession(): void {
    const role = this.auth.session()?.role;
    if (role) this.role.set(role);
  }

  /** Lo llama el shell en cada cambio de ruta: fija la pestaña, deduce el rol
   *  de las pestañas exclusivas y cierra menús/diálogos/paneles abiertos. */
  setActiveTab(tab: Tab): void {
    this.activeTab.set(tab);
    const deduced = TAB_ROLE[tab];
    if (deduced) this.role.set(deduced);
    this.menuRow.set(null);
    this.dialog.set('');
    this.actionRow.set(null);
    this.tracking.set(null);
    this.notifOpen.set(false);
    this.editProfile.set(false);
    this.docsOpen.set(false);
    this.payOpen.set(false);
  }

  private go(tab: Tab): void {
    this.router.navigate(['/app', tab]);
  }

  /**
   * Reproduce al abrir los deep links documentados (README · Parámetros de URL).
   * Solo lee: siembra el estado desde los query params escalares/listas. No
   * reescribe la barra al navegar (como en el prototipo con file://, los enlaces
   * funcionan al abrir). Los params codificados en JSON del prototipo
   * (updates, profile, pubs, tickets, methods, uploaded) no se reproducen.
   */
  seedFromQuery(q: { get(name: string): string | null } | null | undefined): void {
    if (!q) return;
    const get = (k: string) => q.get(k);
    const inList = (arr: readonly string[], v: string | null): v is string => !!v && arr.includes(v);

    const role = get('role');
    if (role === 'reciclador' || role === 'generador') this.role.set(role);

    const view = get('view');
    if (view === 'puntos' || view === 'anuncios') this.mapView.set(view);
    const qstr = get('q');
    if (qstr != null) this.search.set(qstr);
    if (inList(MAP_MATERIALS, get('material'))) this.mapMaterial.set(get('material')!);
    if (inList(POINT_TYPE_KEYS, get('type'))) this.pointType.set(get('type')!);
    const hidden = get('hidden');
    if (hidden != null) this.hiddenTypes.set(hidden.split(',').filter((t) => (POINT_TYPE_KEYS as string[]).includes(t)));
    const filters: Record<string, boolean> = {};
    if (get('near') === '1') filters['Cerca de mí'] = true;
    if (get('heavy') === '1') filters['+20 kg'] = true;
    if (get('today') === '1') filters['Hoy'] = true;
    if (Object.keys(filters).length) this.filters.set(filters);
    if (RECYCLING_POINTS.some((p) => p.id === get('point'))) this.selectedPoint.set(get('point'));

    const stops = get('stops');
    if (stops != null) {
      this.routeIds.set(stops === 'none' ? [] : validStops(stops.split(',')));
    } else {
      const saved = SAVED_ROUTES.find((r) => r.id === get('route'));
      if (saved) { this.routeIds.set(validStops(saved.stops)); this.loadedRoute.set(saved.id); }
    }
    if (get('opt') === '1') { this.routeIds.set(optimizeStops(this.routeIds())); this.optimized.set(true); }
    if (get('panel') === 'rutas') this.savedPanel.set(true);

    if (inList(['t1', 't2', 't3'], get('thread'))) this.thread.set(get('thread')!);
    const rows = [...PICKUPS, ...PUBLICATIONS];
    if (rows.some((r) => r.id === get('chatRow'))) this.chatRow.set(get('chatRow'));
    if (rows.some((r) => r.id === get('menu'))) this.menuRow.set(get('menu'));
    const priority = get('priority');
    if (priority) priority.split(',').forEach((id) => { if (rows.some((r) => r.id === id)) this.rowUpdates.update((u) => ({ ...u, [id]: { ...u[id], priority: true } })); });
    const dialog = get('dialog');
    const row = get('row');
    if (dialog && ['reprogramar', 'coordinar', 'cancelar', 'qr'].includes(dialog) && row && rows.some((r) => r.id === row)) {
      // El QR sólo se abre si la recolección ya admite escaneo (Coordinada / En camino).
      if (dialog !== 'qr' || this.canScan(row)) {
        this.openAction(dialog as 'reprogramar' | 'coordinar' | 'cancelar' | 'qr', row);
        if (dialog === 'reprogramar' || dialog === 'coordinar') {
          if (validDate(get('date') ?? '')) this.scheduleDate.set(get('date')!);
          if (inList(TIME_SLOTS, get('slot'))) this.scheduleSlot.set(get('slot')!);
        }
      }
    } else if (dialog === 'guardar') {
      this.dialog.set('guardar');
    }
    if (PUBLICATIONS.some((r) => r.id === get('track'))) this.tracking.set(get('track'));
    const progress = get('progress');
    if (progress != null) this.trackingStart.set(Math.max(0, Math.min(100, Number(progress) || 0)));

    if (get('notif') === '1') this.notifOpen.set(true);
    const read = get('read');
    if (read != null) this.readIds.set(read.split(',').filter((id) => NOTIF_IDS.includes(id)));
    if (get('edit') === 'perfil') this.openEditProfile();
    if (get('docs') === '1') this.docsOpen.set(true);
    if (get('pay') === '1') this.payOpen.set(true);
    const payDefault = get('payDefault');
    if (payDefault && [...PAY_METHODS, ...this.extraMethods()].some((m) => m.id === payDefault)) this.payDefault.set(payDefault);
  }

  toggleRole(): void {
    this.go(this.isGen() ? 'mapa' : 'publicar');
  }

  goChats(): void { this.go('chats'); }
  goSoporte(): void { this.go('soporte'); }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // =====================================================================
  //  Lectura de archivos (imagen → data URL), igual que el prototipo
  // =====================================================================
  private readFile(input: HTMLInputElement, cb: (name: string, url: string) => void): void {
    const file = input.files && input.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { cb(file.name, ''); return; }
    const reader = new FileReader();
    reader.onload = () => cb(file.name, String(reader.result));
    reader.readAsDataURL(file);
  }

  // =====================================================================
  //  Entregas (recojos y publicaciones)
  // =====================================================================
  private rawRow(id: string | null): Delivery | undefined {
    if (!id) return undefined;
    return [...PICKUPS, ...PUBLICATIONS, ...this.newPubs().map(pubRecord)].find((r) => r.id === id);
  }

  delivery(id: string | null): Delivery | null {
    const base = this.rawRow(id);
    if (!base) return null;
    const u = this.rowUpdates()[base.id] ?? {};
    const result: Delivery = { ...base, ...u };
    if (result.date && result.slot) {
      result.window = result.date.split('-').reverse().join('/') + ' · ' + result.slot;
    }
    return result;
  }

  private rowView(id: string): DeliveryRow {
    const row = this.delivery(id)!;
    const locked = ['Completado', 'Cancelado'].includes(row.state);
    const style = STATE_STYLE[row.state];
    const isRecojo = rowRole(row.id) === 'reciclador';
    return {
      ...row,
      priority: !!row.priority,
      rowBg: row.priority ? '#fdf3dd' : '#ffffff',
      stateBg: style ? style[0] : row.stateBg,
      stateFg: style ? style[1] : row.stateFg,
      menuOpen: this.menuRow() === row.id,
      locked,
      lockHint: locked ? 'Esta recolección ya está cerrada.' : '',
      priorityLabel: row.priority ? 'Quitar prioridad' : 'Marcar como prioritaria',
      canTrack: rowRole(row.id) === 'generador' && row.state === 'En camino',
      canScan: isRecojo && !!row.code && (SCANNABLE_STATES as readonly string[]).includes(row.state),
      canCoordinate: isRecojo && row.state === 'Creada',
      canStartRoute: isRecojo && row.state === 'Coordinada',
    };
  }

  private changeDelivery(id: string, patch: RowUpdate): void {
    this.rowUpdates.update((u) => ({ ...u, [id]: { ...u[id], ...patch } }));
    if (patch.state && ['Cancelado', 'Completado'].includes(patch.state)) {
      this.routeIds.update((ids) => ids.filter((stop) => locOf(stop)?.pickup !== id));
      this.optimized.set(false);
    }
  }

  readonly pickups = computed<DeliveryRow[]>(() => {
    this.rowUpdates(); this.menuRow();
    return PICKUPS.map((p) => this.rowView(p.id));
  });
  readonly publications = computed<DeliveryRow[]>(() => {
    this.rowUpdates(); this.menuRow();
    const fromForm = this.newPubs().map((p) => this.rowView(pubRecord(p).id)).reverse();
    return [...fromForm, ...PUBLICATIONS.map((p) => this.rowView(p.id))];
  });
  readonly activePickups = computed(() => this.pickups().filter((r) => !['Completado', 'Cancelado'].includes(r.state)).length);
  readonly activePublications = computed(() => this.publications().filter((r) => !['Completado', 'Cancelado'].includes(r.state)).length);
  readonly completedPickups = computed(() => 30 + this.pickups().filter((r, i) => r.state === 'Completado' && PICKUPS[i].state !== 'Completado').length);
  readonly canceledPickups = computed(() => 1 + this.pickups().filter((r) => r.state === 'Cancelado').length);
  readonly canceledPublications = computed(() => 1 + this.publications().filter((r) => r.state === 'Cancelado').length);

  toggleMenu(id: string): void { this.menuRow.update((m) => (m === id ? null : id)); }
  togglePriority(id: string): void {
    const row = this.delivery(id);
    this.changeDelivery(id, { priority: !row?.priority });
    this.menuRow.set(null);
  }
  reschedule(id: string): void { if (!this.isLocked(id)) this.openAction('reprogramar', id); }
  cancel(id: string): void { if (!this.isLocked(id)) this.openAction('cancelar', id); }
  private isLocked(id: string): boolean {
    const row = this.delivery(id);
    return !row || ['Completado', 'Cancelado'].includes(row.state);
  }
  /** Coordina día y franja de un recojo recién creado (Creada → Coordinada). */
  coordinate(id: string): void { if (this.delivery(id)?.state === 'Creada') this.openAction('coordinar', id); }
  /** El reciclador arranca el recorrido (Coordinada → En camino): habilita QR y seguimiento. */
  startRoute(id: string): void {
    if (this.delivery(id)?.state === 'Coordinada') { this.changeDelivery(id, { state: 'En camino' }); this.menuRow.set(null); }
  }
  /** El QR solo se habilita una vez coordinada la recolección o en camino (US 07-EP2). */
  private canScan(id: string): boolean {
    const d = this.delivery(id);
    return !!d && !!d.code && (SCANNABLE_STATES as readonly string[]).includes(d.state);
  }
  openScannerRow(id: string): void { if (this.canScan(id)) this.openAction('qr', id); }

  openChat(id: string): void {
    const row = this.delivery(id);
    if (!row) return;
    this.role.set(rowRole(id));
    this.thread.set(row.thread);
    this.chatRow.set(id);
    this.tracking.set(null);
    this.go('chats');
  }

  openAction(dialog: 'guardar' | 'reprogramar' | 'coordinar' | 'cancelar' | 'qr', id: string): void {
    const row = this.delivery(id);
    if (!row) return;
    this.dialog.set(dialog);
    this.actionRow.set(id);
    this.menuRow.set(null);
    this.scheduleDate.set(row.date || '');
    this.scheduleSlot.set(row.slot || TIME_SLOTS[0]);
    this.reason.set('');
    this.manualCode.set('');
    this.formError.set('');
  }
  closeDialog(): void { this.dialog.set(''); this.actionRow.set(null); this.formError.set(''); this.manualCode.set(''); }

  confirmAction(): void {
    const row = this.delivery(this.actionRow());
    if (!row || ['Completado', 'Cancelado'].includes(row.state)) return;
    if (this.dialog() === 'reprogramar' || this.dialog() === 'coordinar') {
      if (!validDate(this.scheduleDate()) || this.scheduleDate() < todayDate()) {
        this.formError.set('Elige una fecha válida desde hoy.');
        return;
      }
      if (!TIME_SLOTS.includes(this.scheduleSlot() as (typeof TIME_SLOTS)[number])) {
        this.formError.set('Elige una franja horaria.');
        return;
      }
      const state = this.dialog() === 'coordinar' ? 'Coordinada' : 'Reprogramado';
      this.changeDelivery(row.id, { state, date: this.scheduleDate(), slot: this.scheduleSlot() });
    } else if (this.dialog() === 'cancelar') {
      const reason = this.reason().trim();
      if (!reason) { this.formError.set('Indica el motivo de la cancelación.'); return; }
      this.changeDelivery(row.id, { state: 'Cancelado', reason: reason.slice(0, 240) });
    }
    this.closeDialog();
  }

  confirmDelivery(manual = false): void {
    const row = this.delivery(this.actionRow());
    if (!row || !row.code || !(SCANNABLE_STATES as readonly string[]).includes(row.state)) return;
    if (manual && this.manualCode().trim().toUpperCase() !== row.code) {
      this.formError.set('El código no corresponde a esta entrega. Revisa el código de muestra.');
      return;
    }
    this.changeDelivery(row.id, { state: 'Completado' });
    this.dialog.set('');
    this.actionRow.set(null);
    this.confirmedRow.set(row.id);
    this.rateOpen.set(true);
    this.rating.set(0);
    this.formError.set('');
  }
  onManualCode(v: string): void { this.manualCode.set(v.toUpperCase()); this.formError.set(''); }
  confirmManual(): void { this.confirmDelivery(true); }
  setRating(n: number): void { this.rating.set(n); }
  closeRate(): void { this.rateOpen.set(false); this.rating.set(0); }

  openScanner(): void {
    const chat = this.chatDelivery();
    const id = this.activeTab() === 'chats' && chat ? chat.id
      : routeStats(this.routeIds()).stops.find((p) => p.pickup)?.pickup || 'r1';
    if (this.canScan(id)) this.openAction('qr', id);
  }
  closeScanner(): void { this.closeDialog(); }

  openTracking(id: string): void { this.tracking.set(id); this.trackingStart.set(0); this.menuRow.set(null); }
  closeTracking(): void { this.tracking.set(null); }
  track(id: string): void { this.openTracking(id); }

  // =====================================================================
  //  Mapa
  // =====================================================================
  onSearch(v: string): void { this.search.set(v); this.selectedPoint.set(null); }
  setMapView(view: 'anuncios' | 'puntos'): void { this.mapView.set(view); this.selectedPoint.set(null); }
  toggleFilter(label: string): void { this.filters.update((f) => ({ ...f, [label]: !f[label] })); }
  toggleMaterial(k: string): void { this.mapMaterial.update((m) => (m === k ? '' : k)); }
  togglePointType(type: string): void { this.pointType.update((t) => (t === type ? '' : type)); }
  toggleLegend(type: string): void {
    this.hiddenTypes.update((h) => (h.includes(type) ? h.filter((t) => t !== type) : [...h, type]));
    this.selectedPoint.set(null);
  }
  clearMapFilters(): void {
    this.search.set(''); this.mapMaterial.set(''); this.pointType.set('');
    this.hiddenTypes.set([]); this.filters.set({}); this.selectedPoint.set(null);
  }
  openPoint(id: string): void { this.selectedPoint.set(id); }
  closePoint(): void { this.selectedPoint.set(null); }

  claim(id: string): void {
    if (this.claimed()[id]) return;
    this.claimed.update((c) => ({ ...c, [id]: true }));
    this.routeIds.update((ids) => validStops([...ids, id]));
    this.optimized.set(false);
  }
  addToRoute(id: string): void {
    this.routeIds.update((ids) => validStops([...ids, id]));
    this.optimized.set(false);
    this.loadedRoute.set('');
  }
  removeStop(id: string): void {
    this.routeIds.update((ids) => ids.filter((s) => s !== id));
    this.optimized.set(false);
    this.loadedRoute.set('');
  }
  openStop(id: string): void {
    if (id.startsWith('p')) {
      this.openPoint(id);
    } else {
      const loc = locOf(id);
      this.setMapView('anuncios');
      this.search.set(loc ? loc.name : '');
      this.mapMaterial.set('');
      this.filters.set({});
    }
  }
  showAd(id: string): void {
    const ad = ADS.find((a) => a.id === id);
    this.mapView.set('anuncios');
    this.search.set(ad ? ad.place.split(' · ')[0] : '');
    this.mapMaterial.set('');
    this.selectedPoint.set(null);
    this.filters.set({});
  }
  optimizeRoute(): void {
    const had = this.routeIds().length;
    this.routeIds.update((ids) => optimizeStops(ids));
    this.optimized.set(true);
    this.routeNotice.set(had ? 'Ruta optimizada por cercanía simulada.' : 'Agrega paradas para optimizar la ruta.');
  }
  openSave(): void {
    this.dialog.set('guardar'); this.routeName.set(''); this.routeDescription.set('');
    this.formError.set(''); this.actionRow.set(null);
  }
  saveRoute(): void {
    const name = this.routeName().trim();
    if (!name) { this.formError.set('Ingresa un nombre para la ruta.'); return; }
    if (!this.routeIds().length) { this.formError.set('Agrega al menos una parada antes de guardar.'); return; }
    const id = 'ruta-' + this.nextRouteId++;
    this.savedRoutesState.update((rs) => [...rs, { id, name: name.slice(0, 60), description: this.routeDescription().trim().slice(0, 240), stops: this.routeIds().slice() }]);
    this.loadedRoute.set(id);
    this.savedPanel.set(true);
    this.dialog.set('');
    this.routeNotice.set('Ruta guardada: ' + name);
    this.formError.set('');
  }
  openSaved(): void { this.savedPanel.set(true); this.selectedPoint.set(null); }
  closeSaved(): void { this.savedPanel.set(false); }
  loadSavedRoute(r: SavedRoute): void {
    const ids = r.stops.filter((id) => {
      const p = locOf(id);
      return !p?.pickup || !['Cancelado', 'Completado'].includes(this.delivery(p.pickup)?.state ?? '');
    });
    this.routeIds.set(ids);
    this.loadedRoute.set(r.id);
    this.optimized.set(false);
    this.savedPanel.set(false);
    this.selectedPoint.set(null);
    this.search.set(''); this.mapMaterial.set(''); this.pointType.set(''); this.hiddenTypes.set([]); this.filters.set({});
    this.routeNotice.set('Ruta cargada: ' + r.name);
  }
  removeSavedRoute(r: SavedRoute): void {
    this.savedRoutesState.update((rs) => rs.filter((s) => s.id !== r.id));
    if (this.loadedRoute() === r.id) this.loadedRoute.set('');
    this.routeNotice.set('Ruta eliminada: ' + r.name);
  }
  routeChat(): void {
    const stop = routeStats(this.routeIds()).stops.find((p) => p.pickup);
    if (stop?.pickup) this.openChat(stop.pickup);
  }

  private readonly featuredId = computed(() => (ADS.filter((a) => !this.claimed()[a.id])[0] || {}).id);
  private readonly stats = computed(() => routeStats(this.routeIds()));
  private acceptsMaterial(mats: string[]): boolean {
    const material = this.mapMaterial();
    return !material || mats.includes(material) || (material === 'plastico' && mats.includes('pet'));
  }

  readonly allAds = computed(() =>
    ADS.map((a, i) => {
      const claimed = !!this.claimed()[a.id];
      const featured = a.id === this.featuredId();
      const mat = MATERIALS[a.mat];
      return {
        ...a,
        x: ROUTE_LOCATIONS[i].x, y: ROUTE_LOCATIONS[i].y,
        stopNumber: this.routeIds().indexOf(a.id) + 1,
        pinLabel: 'Anuncio: ' + a.material + ' · ' + a.place,
        color: mat.color, iconFg: mat.fg, icon: mat.icon,
        cardBorder: claimed ? '#4c7a2f' : featured ? '#16281f' : '#e2e5dc',
        cardShadow: featured ? '0 2px 0 #16281f' : 'none',
        claimed, featured,
        btnLabel: claimed ? 'Reclamado' : 'Reclamar',
        btnBg: claimed ? '#eef2e4' : featured ? '#a3d24a' : '#ffffff',
        btnFg: claimed ? '#3f6224' : '#16281f',
        btnBorder: claimed ? '#eef2e4' : featured ? '#a3d24a' : '#16281f',
      };
    }),
  );
  readonly ads = computed(() => {
    const query = normalizeSearch(this.search());
    const f = this.filters();
    return this.allAds().filter((a) =>
      normalizeSearch(a.place + ' ' + a.material).includes(query) &&
      this.acceptsMaterial([a.mat]) &&
      (!f['Cerca de mí'] || parseFloat(a.dist.replace(',', '.')) <= 5) &&
      (!f['+20 kg'] || parseFloat(a.kg.replace(',', '.')) > 20) &&
      (!f['Hoy'] || a.window.startsWith('HOY')),
    );
  });
  readonly allPoints = computed(() =>
    RECYCLING_POINTS.map((p) => {
      const inRoute = this.routeIds().includes(p.id);
      return {
        ...p,
        typeLabel: POINT_TYPES[p.type].label, icon: POINT_TYPES[p.type].icon,
        pinLabel: POINT_TYPES[p.type].label + ': ' + p.name,
        distanceLabel: p.distance.toFixed(1).replace('.', ',') + ' KM',
        ratingLabel: p.rating.toFixed(1).replace('.', ','),
        tags: p.materials.map((k) => ({ label: MATERIALS[k].label })),
        cardBorder: this.selectedPoint() === p.id ? '#16281f' : inRoute ? '#4c7a2f' : '#e2e5dc',
        inRoute,
        stopNumber: this.routeIds().indexOf(p.id) + 1,
        routeBg: inRoute ? '#eef2e4' : '#a3d24a',
        routeLabel: inRoute ? 'Agregado a ruta' : 'Agregar a ruta',
        routeHint: inRoute ? 'Este punto ya está incluido como parada en tu ruta activa.' : 'Punto fijo · no requiere reclamar un anuncio.',
      };
    }),
  );
  readonly visiblePoints = computed(() => this.allPoints().filter((p) => !this.hiddenTypes().includes(p.type)));
  readonly points = computed(() => {
    const query = normalizeSearch(this.search());
    const f = this.filters();
    return this.visiblePoints().filter((p) =>
      normalizeSearch(p.name + ' ' + p.address + ' ' + p.district).includes(query) &&
      this.acceptsMaterial(p.materials) &&
      (!this.pointType() || p.type === this.pointType()) &&
      (!f['Cerca de mí'] || p.distance <= 5),
    );
  });
  readonly isPointsView = computed(() => this.mapView() === 'puntos');
  readonly isAdsView = computed(() => this.mapView() === 'anuncios');
  readonly adPins = computed(() => (this.isPointsView() ? this.allAds() : this.ads()));
  readonly pointPins = computed(() => (this.isPointsView() ? this.points() : this.visiblePoints()));
  readonly mapViews = computed(() =>
    (['anuncios', 'puntos'] as const).map((view) => ({
      label: view === 'puntos' ? 'Puntos' : 'Anuncios', view,
      ...this.chip(view === 'puntos' ? 'Puntos' : 'Anuncios', this.mapView() === view),
      active: this.mapView() === view,
    })),
  );
  readonly filterChips = computed(() => {
    const labels = this.isPointsView() ? ['Cerca de mí'] : ['Cerca de mí', '+20 kg', 'Hoy'];
    const base = labels.map((l) => ({ label: l, key: l, ...this.chip(l, !!this.filters()[l]), active: !!this.filters()[l], kind: 'filter' as const }));
    const mats = MAP_MATERIALS.map((k) => ({ label: MATERIALS[k].label, key: k as string, ...this.chip(MATERIALS[k].label, this.mapMaterial() === k), active: this.mapMaterial() === k, kind: 'material' as const }));
    return [...base, ...mats];
  });
  readonly pointTypeChips = computed(() =>
    ['', ...POINT_TYPE_KEYS].map((type) => ({
      type, label: type ? POINT_TYPES[type as PointTypeKey].label : 'Todos',
      ...this.chip(type ? POINT_TYPES[type as PointTypeKey].label : 'Todos', this.pointType() === type),
      active: this.pointType() === type,
    })),
  );
  readonly pointLegend = computed(() =>
    POINT_TYPE_KEYS.map((type) => {
      const active = !this.hiddenTypes().includes(type);
      return { type, label: POINT_TYPES[type].label, active, opacity: active ? '1' : '0.4', decoration: active ? 'none' : 'line-through' };
    }),
  );
  readonly pointDetail = computed(() => this.allPoints().find((p) => p.id === this.selectedPoint()) ?? null);
  readonly mapResultCount = computed(() => (this.isPointsView() ? this.points().length + ' puntos' : this.ads().length + ' anuncios') + ' encontrados');
  readonly mapEmpty = computed(() => (this.isPointsView() ? !this.points().length : !this.ads().length));
  readonly emptyMessage = computed(() => (this.isPointsView() ? 'No encontramos puntos de reciclaje.' : 'No encontramos anuncios.'));

  readonly routeStopsView = computed(() => this.stats().stops.map((p, i) => ({ ...p, number: i + 1 })));
  readonly routeTrace = computed(() => [ROUTE_ORIGIN, ...this.stats().stops].map((p) => p.x + ',' + p.y).join(' '));
  readonly routeKg = computed(() => this.stats().kg.replace('.', ','));
  readonly routeMeta = computed(() => this.stats().stops.length + ' paradas');
  readonly routeDistance = computed(() => this.stats().distanceLabel);
  readonly routeMinutes = computed(() => this.stats().minutes);
  readonly routeCanScan = computed(() => this.stats().stops.some((p) => p.pickup));
  readonly routeEmpty = computed(() => !this.routeStopsView().length);
  readonly savedRoutesView = computed(() =>
    this.savedRoutesState().map((r) => {
      const m = routeStats(r.stops);
      return { ...r, count: m.stops.length, distance: m.distanceLabel, minutes: m.minutes };
    }),
  );

  private chip(label: string, on: boolean, activeBg?: string, activeFg?: string) {
    return {
      bg: on ? activeBg || '#16281f' : '#ffffff',
      fg: on ? activeFg || '#ffffff' : '#3d4a3f',
      border: on ? activeBg || '#16281f' : '#d8dcd2',
    };
  }

  // =====================================================================
  //  Cabecera / navegación lateral
  // =====================================================================
  readonly tabs = computed(() => (this.isGen() ? GENERADOR_TABS : RECICLADOR_TABS));
  readonly navItems = computed(() => {
    const active = this.activeTab();
    return this.tabs().map((k) => ({
      tab: k, label: TAB_LABELS[k], icon: ICONS[k],
      bg: active === k ? '#26402f' : 'transparent',
      color: active === k ? '#a3d24a' : '#8fa392',
    }));
  });
  readonly pageTitle = computed(() => HEADERS[this.activeTab()][0]);
  readonly pageMeta = computed(() => {
    const a = this.activeTab();
    if (a === 'mapa') return ADS.length + ' anuncios · ' + RECYCLING_POINTS.length + ' puntos de reciclaje · Lima';
    if (a === 'recojos') return this.activePickups() + ' activos · ' + this.completedPickups() + ' completados este mes';
    if (a === 'publicaciones') return this.activePublications() + ' activos · 12 completados este mes';
    if (a === 'perfil') return (this.isGen() ? 'Generador' : 'Reciclador') + ' verificado · Lima Centro';
    return HEADERS[a][1];
  });
  readonly statusLabel = computed(() => (this.isGen() ? this.activePublications() + ' ANUNCIOS ACTIVOS' : this.activePickups() + ' RECOJOS ACTIVOS'));
  readonly roleShort = computed(() => (this.isGen() ? 'GEN' : 'REC'));
  readonly avatarInitial = computed(() => this.profile().name.trim()[0] || 'M');

  // =====================================================================
  //  Chats
  // =====================================================================
  readonly threadsView = computed(() => {
    const active = this.thread();
    return THREADS.map((t) => ({ ...t, bg: active === t.id ? '#f4f5f0' : '#ffffff' }));
  });
  private readonly activeThread = computed(() => THREADS.find((t) => t.id === this.thread()) ?? THREADS[0]);
  readonly chatDelivery = computed<Delivery | null>(() => {
    const rows = this.isGen() ? PUBLICATIONS : PICKUPS;
    const fallback = rows.find((r) => r.thread === this.activeThread().id);
    return this.delivery(this.chatRow()) ?? this.delivery(fallback ? fallback.id : null);
  });
  readonly messages = computed(() => {
    const id = this.activeThread().id;
    const convo = [...(CONVOS[id] ?? []), ...(this.extra()[id] ?? [])];
    return convo.map((m) => ({
      text: m.text, time: m.time,
      align: m.from === 'me' ? 'flex-end' : 'flex-start',
      bg: m.from === 'me' ? '#16281f' : '#ffffff',
      fg: m.from === 'me' ? '#ffffff' : '#16281f',
      border: m.from === 'me' ? '#16281f' : '#e2e5dc',
      metaFg: m.from === 'me' ? '#8fa392' : '#8b9186',
    }));
  });
  readonly activeName = computed(() => (this.isGen() && this.chatDelivery() ? this.chatDelivery()!.person : this.activeThread().name));
  readonly activeInitials = computed(() =>
    this.isGen() && this.chatDelivery()
      ? this.chatDelivery()!.person.split(' ').map((w) => w[0]).slice(0, 2).join('')
      : this.activeThread().initials,
  );
  readonly activeSub = computed(() => {
    const d = this.chatDelivery();
    return d ? d.kg + ' · ' + d.material : this.activeThread().tag;
  });
  readonly chatCanTrack = computed(() => this.isGen() && this.chatDelivery()?.state === 'En camino');
  readonly chatCanScan = computed(() => {
    const d = this.chatDelivery();
    return !this.isGen() && !!d && !!d.code && (SCANNABLE_STATES as readonly string[]).includes(d.state);
  });
  selectThread(id: string): void {
    const rows = this.isGen() ? PUBLICATIONS : PICKUPS;
    this.thread.set(id);
    this.chatRow.set((rows.find((r) => r.thread === id) || {}).id ?? null);
    this.tracking.set(null);
  }
  onDraft(v: string): void { this.draft.set(v); }
  send(): void {
    const text = this.draft().trim();
    if (!text) return;
    const id = this.activeThread().id;
    this.extra.update((e) => ({ ...e, [id]: [...(e[id] ?? []), { from: 'me', text, time: 'ahora' }] }));
    this.draft.set('');
  }
  chatTrack(): void { const d = this.chatDelivery(); if (d) this.openTracking(d.id); }

  // =====================================================================
  //  Publicar
  // =====================================================================
  readonly matChips = computed(() =>
    MAT_ORDER.map((k) => ({ key: k, label: MATERIALS[k].label, active: !!this.materials()[k], ...this.chip(MATERIALS[k].label, !!this.materials()[k], '#a3d24a', '#16281f') })),
  );
  private readonly pickedMats = computed(() => MAT_ORDER.filter((k) => this.materials()[k]));
  private readonly previewMat = computed(() => MATERIALS[this.pickedMats()[0]] ?? MATERIALS['carton']);
  readonly payChips = computed(() => PAY_OPTIONS.map((o) => ({ label: o, border: this.pubPay() === o ? '#16281f' : '#d8dcd2', weight: this.pubPay() === o ? '600' : '400' })));
  readonly suggestion = computed(() => {
    const source = normalizeSearch(this.note() + ' ' + this.photoName());
    if (!source.trim()) return null;
    const origin = this.photoName() ? 'foto' : 'nota';
    const rule = SUGGEST_RULES.find((r) => r.keys.some((k) => source.includes(k)) && !this.materials()[r.mat] && this.dismissedSuggestion() !== r.mat + ':' + origin);
    if (!rule) return null;
    return { key: rule.mat + ':' + origin, mat: rule.mat, label: MATERIALS[rule.mat].label, confidence: rule.confidence + (this.photoName() ? 4 : 0), source: this.photoName() ? 'la foto' : 'la nota' };
  });
  readonly hasSuggestion = computed(() => !!this.suggestion());
  readonly suggestionText = computed(() => { const s = this.suggestion(); return s ? 'Por ' + s.source + ', parece ' + s.label + '.' : ''; });
  readonly suggestionConfidence = computed(() => { const s = this.suggestion(); return s ? 'CONFIANZA ' + s.confidence + '%' : ''; });
  readonly previewKg = computed(() => (this.qty() || '—') + ' kg');
  readonly previewMatLabel = computed(() => (this.pickedMats().length ? this.pickedMats().map((k) => MATERIALS[k].label).join(', ') : 'Selecciona material'));
  readonly previewColor = computed(() => (this.pickedMats().length ? this.previewMat().color : '#eceee7'));
  readonly previewIconFg = computed(() => (this.pickedMats().length ? this.previewMat().fg : '#a8b2a2'));
  readonly previewIcon = computed(() => this.previewMat().icon);
  readonly previewWindow = computed(() => (this.pubDay().trim() || this.pubTime().trim() ? (this.pubDay().trim() + ' ' + this.pubTime().trim()).trim().toUpperCase() : 'SIN HORARIO'));
  readonly previewPay = computed(() => this.pubPay().toUpperCase());
  readonly publishHint = computed(() => (this.pickedMats().length ? 'Visible para 14 recicladores cerca' : 'Elige al menos un material'));
  // Límite de la nota (US 02-EP1): tope blando. En vez de cortar el texto en
  // seco, se deja escribir y, si se pasa, se muestra un error que bloquea Publicar.
  readonly noteLimit = 200;
  readonly errQty = computed(() => this.pubErrors()['qty'] || '');
  readonly errMats = computed(() => this.pubErrors()['mats'] || '');
  readonly errWindow = computed(() => this.pubErrors()['window'] || '');
  readonly errNote = computed(() => this.pubErrors()['note'] || '');
  readonly noteCount = computed(() => this.note().length);
  readonly noteOver = computed(() => this.note().length > this.noteLimit);
  readonly noteCounter = computed(() => this.note().length + '/' + this.noteLimit);
  readonly noteCounterFg = computed(() => (this.noteOver() ? '#b1573f' : '#8b9186'));
  readonly qtyBorder = computed(() => (this.pubErrors()['qty'] ? '#b1573f' : '#e2e5dc'));
  readonly windowBorder = computed(() => (this.pubErrors()['window'] ? '#b1573f' : '#e2e5dc'));
  readonly noteBorder = computed(() => (this.noteOver() || this.pubErrors()['note'] ? '#b1573f' : '#e2e5dc'));
  toggleMat(k: string): void { this.materials.update((m) => ({ ...m, [k]: !m[k] })); }
  onQty(v: string): void { this.qty.set(v.replace(/[^\d.,]/g, '').slice(0, 5)); }
  setQty(v: string): void { this.qty.set(v); }
  onPubDay(v: string): void { this.pubDay.set(v.slice(0, 20)); }
  onPubTime(v: string): void { this.pubTime.set(v.slice(0, 20)); }
  selectPay(o: string): void { this.pubPay.set(o); }
  // Tope físico amplio (anti-desbordes) para poder superar el límite blando y ver el error.
  onNote(v: string): void { this.note.set(v.slice(0, 2000)); this.pubErrors.update((e) => ({ ...e, note: '' })); }
  onPhoto(input: HTMLInputElement): void { this.readFile(input, (name, url) => { this.photo.set(url); this.photoName.set(name); this.dismissedSuggestion.set(''); }); }
  removePhoto(): void { this.photo.set(''); this.photoName.set(''); }
  applySuggestion(): void {
    const s = this.suggestion();
    if (!s) return;
    this.materials.update((m) => ({ ...m, [s.mat]: true }));
    this.pubErrors.update((e) => ({ ...e, mats: '' }));
  }
  dismissSuggestion(): void { const s = this.suggestion(); if (s) this.dismissedSuggestion.set(s.key); }
  publishAd(): void {
    const errors: Record<string, string> = {};
    const qty = parseFloat((this.qty() || '').replace(',', '.'));
    const mats = MAT_ORDER.filter((k) => this.materials()[k]);
    if (!this.qty()) errors['qty'] = 'Ingresa la cantidad aproximada en kilos.';
    else if (!(qty > 0)) errors['qty'] = 'La cantidad debe ser mayor que cero.';
    if (!mats.length) errors['mats'] = 'Elige al menos un tipo de material.';
    if (!this.pubDay().trim() || !this.pubTime().trim()) errors['window'] = 'Indica el día y el rango de horas en que pueden pasar.';
    if (this.note().length > this.noteLimit) errors['note'] = 'Error: la observación excede el límite de ' + this.noteLimit + ' caracteres.';
    if (Object.keys(errors).length) { this.pubErrors.set(errors); return; }
    const pub: NewPub = {
      id: 'n' + (this.newPubs().length + 1), mats: mats.slice(),
      kg: this.qty() + ' kg', window: (this.pubDay().trim() + ' ' + this.pubTime().trim()).toUpperCase().slice(0, 40),
      pay: this.pubPay(), note: this.note().trim().slice(0, this.noteLimit),
    };
    this.newPubs.update((n) => [...n, pub]);
    this.pubErrors.set({}); this.qty.set(''); this.materials.set({}); this.pubDay.set(''); this.pubTime.set('');
    this.pubPay.set('Sin pago'); this.note.set(''); this.photo.set(''); this.photoName.set(''); this.dismissedSuggestion.set('');
    this.go('publicaciones');
  }

  // =====================================================================
  //  Perfil / documentos / pagos
  // =====================================================================
  readonly profileRoleLine = computed(() => (this.isGen() ? 'Generador' : 'Reciclador') + ' · Lima Centro');
  readonly profileMats = computed(() => this.profile().mats.map((k) => MATERIALS[k].label).join(', ') || 'Sin materiales');

  // ---- Disponibilidad / visibilidad (US 28-EP4, simulado)
  readonly visibilityLabel = computed(() => (this.available() ? 'Activa' : 'Oculta'));
  readonly visibilityFg = computed(() => (this.available() ? '#4c7a2f' : '#b1573f'));
  readonly visibilityHint = computed(() =>
    this.available()
      ? (this.isGen() ? 'Tus anuncios aparecen en el mapa de los recicladores.' : 'Apareces como reciclador disponible en el mapa.')
      : (this.isGen() ? 'Tus anuncios quedan ocultos: nadie nuevo puede reclamarlos.' : 'Estás oculto en el mapa: no recibirás anuncios nuevos.'),
  );
  toggleAvailability(): void { this.available.update((v) => !v); }

  // ---- Historial de actividad (datos de muestra; alimenta la tabla y el CSV)
  readonly history: ReadonlyArray<{ type: string; material: string; party: string; date: string; rating: string }> = [
    { type: 'Recojo', material: 'Bolsas de plástico · 9 kg', party: 'Emilia Valencia', date: 'Hace 8 h', rating: '5.0' },
    { type: 'Recojo', material: 'Cartón plegado · 22 kg', party: 'Juan Flores', date: 'Hace 20 h', rating: '4.8' },
    { type: 'Recojo', material: 'Vidrio mixto · 14 kg', party: 'Camila Salazar', date: 'Hace 2 d', rating: '4.9' },
  ];
  /** Historial como CSV (se genera en el cliente, sin backend). Separado para poder probarlo. */
  historyCsv(): string {
    const esc = (c: string) => '"' + String(c).replace(/"/g, '""') + '"';
    const header = ['Tipo', 'Material', 'Contraparte', 'Fecha', 'Valoración'];
    const rows = this.history.map((h) => [h.type, h.material, h.party, h.date, h.rating]);
    return [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
  }
  /** Descarga el historial como archivo CSV (US 36-EP5). */
  exportHistoryCsv(): void {
    const blob = new Blob(['﻿' + this.historyCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qhurinet-historial.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  /** Comprobante en PDF: abre el diálogo de impresión del navegador (US 36-EP5). */
  exportHistoryPdf(): void { window.print(); }
  readonly pfMatChips = computed(() => {
    const pf = this.profileForm();
    return MAT_ORDER.map((k) => ({ key: k, label: MATERIALS[k].label, ...this.chip(MATERIALS[k].label, !!(pf && pf.mats.includes(k)), '#a3d24a', '#16281f') }));
  });
  readonly pfErrName = computed(() => this.profileErrors()['name'] || '');
  readonly pfErrPhone = computed(() => this.profileErrors()['phone'] || '');
  readonly pfErrMats = computed(() => this.profileErrors()['mats'] || '');
  openEditProfile(): void {
    this.profileForm.set({ ...this.profile(), mats: this.profile().mats.slice() });
    this.profileErrors.set({});
    this.editProfile.set(true);
  }
  closeEdit(): void { this.editProfile.set(false); this.profileForm.set(null); this.profileErrors.set({}); }
  onPfField(key: 'name' | 'phone' | 'bio', v: string): void {
    const max = key === 'bio' ? 240 : 60;
    this.profileForm.update((f) => (f ? { ...f, [key]: v.slice(0, max) } : f));
    this.profileErrors.update((e) => ({ ...e, [key]: '' }));
  }
  togglePfMat(k: string): void {
    this.profileForm.update((f) => (f ? { ...f, mats: f.mats.includes(k) ? f.mats.filter((m) => m !== k) : [...f.mats, k] } : f));
  }
  onPfPhoto(input: HTMLInputElement): void { this.readFile(input, (_n, url) => { if (url) this.profileForm.update((f) => (f ? { ...f, photo: url } : f)); }); }
  removePfPhoto(): void { this.profileForm.update((f) => (f ? { ...f, photo: '' } : f)); }
  saveProfile(): void {
    const f = this.profileForm();
    if (!f) return;
    const errors: Record<string, string> = {};
    if (!f.name.trim()) errors['name'] = 'El nombre no puede quedar vacío.';
    if (!/^\d{9}$/.test(f.phone.replace(/^\+?51/, '').replace(/\D/g, ''))) errors['phone'] = 'Ingresa un teléfono de 9 dígitos.';
    if (!f.mats.length) errors['mats'] = 'Elige al menos un material.';
    if (Object.keys(errors).length) { this.profileErrors.set(errors); return; }
    this.profile.set({ name: f.name.trim().slice(0, 60), email: this.profile().email, phone: f.phone.trim().slice(0, 20), bio: f.bio.trim().slice(0, 240), mats: f.mats.slice(), photo: f.photo });
    this.editProfile.set(false); this.profileForm.set(null); this.profileErrors.set({});
  }

  readonly documentsView = computed(() =>
    [...DOCUMENTS, ...this.uploadedDocs()].map((d) => ({
      ...d, dot: d.state === 'Aprobado' ? '#4c7a2f' : '#e8b53a', stateFg: d.state === 'Aprobado' ? '#4c7a2f' : '#8a6a1f', stateLabel: d.state.toUpperCase(), fresh: d.id.startsWith('u'),
    })),
  );
  readonly approvedCount = computed(() => [...DOCUMENTS, ...this.uploadedDocs()].filter((d) => d.state === 'Aprobado').length);
  readonly docTypeChips = computed(() => DOC_TYPES.map((t) => ({ label: t, ...this.chip(t, this.docType() === t) })));
  openDocs(): void { this.docsOpen.set(true); this.docError.set(''); this.docFile.set(null); }
  closeDocs(): void { this.docsOpen.set(false); this.docError.set(''); }
  selectDocType(t: string): void { this.docType.set(t); }
  onDocFile(input: HTMLInputElement): void { this.readFile(input, (name) => { this.docFile.set(name); this.docError.set(''); }); }
  uploadDoc(): void {
    const file = this.docFile();
    if (!file) { this.docError.set('Selecciona un archivo (PDF o imagen) antes de subirlo.'); return; }
    const id = 'u' + (this.uploadedDocs().length + 1);
    this.uploadedDocs.update((u) => [...u, { id, type: this.docType(), name: file.slice(0, 60), state: 'Aprobado', date: shortDate() }]);
    this.docFile.set(null); this.docError.set(''); this.docType.set('DNI');
  }

  readonly payments = computed(() =>
    [...PAY_METHODS, ...this.extraMethods()].map((m) => ({
      id: m.id, label: PAY_KINDS[m.kind].short, bg: PAY_KINDS[m.kind].bg, fg: PAY_KINDS[m.kind].fg, detail: m.detail,
      isDefault: this.payDefault() === m.id, canUse: this.payDefault() !== m.id,
    })),
  );
  readonly payKindChips = computed(() => Object.keys(PAY_KINDS).map((k) => ({ key: k, label: PAY_KINDS[k].label, ...this.chip(PAY_KINDS[k].label, this.payKind() === k) })));
  readonly payHasField = computed(() => !!PAY_KINDS[this.payKind()].field);
  readonly payFieldLabel = computed(() => PAY_KINDS[this.payKind()].field);
  readonly payPlaceholder = computed(() => PAY_KINDS[this.payKind()].placeholder);
  readonly payCheckBg = computed(() => (this.payAsDefault() ? '#16281f' : '#ffffff'));
  readonly payCheckMark = computed(() => (this.payAsDefault() ? '✓' : ''));
  usePayMethod(id: string): void { this.payDefault.set(id); }
  openPay(): void { this.payOpen.set(true); this.payError.set(''); this.payDetail.set(''); this.payKind.set('yape'); this.payAsDefault.set(true); }
  closePay(): void { this.payOpen.set(false); this.payError.set(''); }
  selectPayKind(k: string): void { this.payKind.set(k); this.payError.set(''); this.payDetail.set(''); }
  onPayDetail(v: string): void { this.payDetail.set(v); this.payError.set(''); }
  togglePayDefault(): void { this.payAsDefault.update((v) => !v); }
  savePayMethod(): void {
    const kind = PAY_KINDS[this.payKind()];
    const detail = this.payDetail().trim();
    if (kind.field && !detail) { this.payError.set('Completa el campo ' + kind.field.toLowerCase() + '.'); return; }
    if (this.payKind() === 'tarjeta' && !/^\d{4}$/.test(detail)) { this.payError.set('Ingresa los últimos 4 dígitos de la tarjeta.'); return; }
    if (['yape', 'plin'].includes(this.payKind()) && !/^\d{9}$/.test(detail.replace(/^\+?51/, '').replace(/\D/g, ''))) { this.payError.set('Ingresa un celular de 9 dígitos.'); return; }
    const id = 'm' + (this.extraMethods().length + 3);
    const shown = this.payKind() === 'tarjeta' ? '•••• ' + detail
      : ['yape', 'plin'].includes(this.payKind()) ? detail.replace(/(\d{3})\s?\d{3}\s?(\d{3})$/, '$1 ••• $2') : detail || 'Pago en mano al entregar';
    this.extraMethods.update((ms) => [...ms, { id, kind: this.payKind(), detail: shown.slice(0, 40) }]);
    if (this.payAsDefault()) this.payDefault.set(id);
    this.payOpen.set(false); this.payDetail.set(''); this.payError.set(''); this.payKind.set('yape'); this.payAsDefault.set(true);
  }

  // =====================================================================
  //  Soporte
  // =====================================================================
  readonly faqs = computed(() => FAQ_DATA.map((f, i) => ({ q: f.q, a: f.a, open: !!this.faqOpen()[i], sign: this.faqOpen()[i] ? '−' : '+', index: i })));
  readonly reportChips = computed(() => REPORT_CATEGORIES.map((c) => ({ label: c, border: this.reportCategory() === c ? '#16281f' : '#d8dcd2', weight: this.reportCategory() === c ? '600' : '400' })));
  readonly ticketsView = computed(() =>
    [...this.newTickets()].reverse().concat(TICKETS).map((t) => ({
      id: t.id, title: t.title, state: t.state, bg: TICKET_STATES[t.state][0], fg: TICKET_STATES[t.state][1],
      meta: t.category + (t.evidence ? ' · evidencia: ' + (t.evidenceName || 'adjunta') : ''),
    })),
  );
  toggleFaq(i: number): void { this.faqOpen.update((f) => ({ ...f, [i]: !f[i] })); }
  selectReportCategory(c: string): void { this.reportCategory.set(c); }
  onReportText(v: string): void { this.reportText.set(v.slice(0, 500)); this.reportError.set(''); }
  onReportFile(input: HTMLInputElement): void { this.readFile(input, (name) => this.reportFile.set(name)); }
  removeReportFile(): void { this.reportFile.set(''); }
  sendReport(): void {
    const text = this.reportText().trim();
    if (!text) { this.reportError.set('Cuéntanos qué pasó antes de enviar el reporte.'); return; }
    const id = '#' + (4950 + this.newTickets().length);
    const evidenceName = this.reportFile().trim();
    this.newTickets.update((t) => [...t, { id, title: text.slice(0, 80), category: this.reportCategory(), state: 'Abierto', evidence: !!evidenceName, evidenceName: evidenceName.slice(0, 60) }]);
    this.reportText.set(''); this.reportFile.set(''); this.reportError.set('');
    this.reportNotice.set('Ticket ' + id + ' creado. Te respondemos en menos de 12 minutos.');
  }

  // =====================================================================
  //  Notificaciones
  // =====================================================================
  readonly notificationsView = computed(() => {
    const read = this.readIds();
    return NOTIFICATIONS[this.role()].map((n) => {
      const unread = !read.includes(n.id);
      return { ...n, unread, bg: unread ? '#f7f9f2' : '#ffffff', dot: unread ? '#4c7a2f' : '#d8dcd2', weight: unread ? '600' : '500' };
    });
  });
  readonly unreadCount = computed(() => this.notificationsView().filter((n) => n.unread).length);
  readonly hasUnread = computed(() => this.unreadCount() > 0);
  readonly allRead = computed(() => this.unreadCount() === 0);
  toggleNotif(): void { this.notifOpen.update((v) => !v); }
  closeNotif(): void { this.notifOpen.set(false); }
  markRead(id: string): void { this.readIds.update((r) => (r.includes(id) ? r : [...r, id])); }
  markAllRead(): void { this.readIds.update((r) => [...new Set([...r, ...NOTIFICATIONS[this.role()].map((n) => n.id)])]); }

  // =====================================================================
  //  Modales (visibilidad derivada)
  // =====================================================================
  readonly actionDelivery = computed(() => this.delivery(this.actionRow()));
  readonly lockedAction = computed(() => { const d = this.actionDelivery(); return !d || ['Completado', 'Cancelado'].includes(d.state); });
  private readonly validActionRole = computed(() => { const d = this.actionDelivery(); return !!d && rowRole(d.id) === (this.isGen() ? 'generador' : 'reciclador'); });
  readonly actionDialog = computed(() => this.validActionRole() && ['reprogramar', 'coordinar', 'cancelar'].includes(this.dialog()));
  readonly actionTitle = computed(() => {
    const d = this.dialog();
    return d === 'cancelar' ? 'Cancelar recolección' : d === 'coordinar' ? 'Coordinar recolección' : 'Reprogramar recolección';
  });
  readonly isCoordinate = computed(() => this.dialog() === 'coordinar');
  readonly showSchedule = computed(() => this.dialog() === 'reprogramar' || this.dialog() === 'coordinar');
  readonly isCancel = computed(() => this.dialog() === 'cancelar');
  readonly saveDialog = computed(() => this.activeTab() === 'mapa' && this.dialog() === 'guardar');
  readonly scannerOpen = computed(() => {
    const d = this.actionDelivery();
    return !this.isGen() && !!d && this.dialog() === 'qr' && !!d.code && (SCANNABLE_STATES as readonly string[]).includes(d.state);
  });
  readonly scannerTitle = computed(() => { const d = this.actionDelivery(); return d ? d.place + ' · ' + d.kg : ''; });
  readonly trackingVisible = computed(() => { const t = this.delivery(this.tracking()); return this.isGen() && ['publicaciones', 'chats'].includes(this.activeTab()) && !!t && t.state === 'En camino'; });
  readonly tracked = computed(() => this.delivery(this.tracking()));
  readonly collectorIcon = ICONS['perfil'];
  readonly confirmedDelivery = computed(() => this.delivery(this.confirmedRow()));
  readonly confirmedTitle = computed(() => { const d = this.confirmedDelivery(); return d ? d.kg + ' de ' + d.material + ' recuperados' : 'Entrega confirmada'; });
  readonly confirmedPerson = computed(() => this.confirmedDelivery()?.person ?? '');
  readonly stars = computed(() => [1, 2, 3, 4, 5].map((n) => ({ n, bg: this.rating() >= n ? '#a3d24a' : '#ffffff', fg: '#16281f', border: this.rating() >= n ? '#a3d24a' : '#d8dcd2' })));
  readonly timeSlots = TIME_SLOTS;
  readonly today = todayDate();
  onScheduleDate(v: string): void { this.scheduleDate.set(v); }
  onScheduleSlot(v: string): void { this.scheduleSlot.set(v); }
  onReason(v: string): void { this.reason.set(v); }
  onRouteName(v: string): void { this.routeName.set(v); }
  onRouteDescription(v: string): void { this.routeDescription.set(v); }
}
