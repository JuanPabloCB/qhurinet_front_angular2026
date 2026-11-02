import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { ConsoleStore } from './console-store';

// Comportamiento SIMULADO de la consola: reclamar, ruta, reprogramar/cancelar,
// publicar, notificaciones y chat. Router simulado (sin rutas reales).
describe('ConsoleStore', () => {
  let store: ConsoleStore;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigate = vi.fn();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: Router, useValue: { navigate } }],
    });
    store = TestBed.inject(ConsoleStore);
  });

  it('arranca con la ruta activa a1,a2 y dos anuncios reclamados', () => {
    expect(store.routeIds()).toEqual(['a1', 'a2']);
    expect(store.claimed()).toEqual({ a1: true, a2: true });
  });

  it('reclamar un anuncio lo marca y lo agrega a la ruta', () => {
    store.claim('a3');
    expect(store.claimed()['a3']).toBe(true);
    expect(store.routeIds()).toContain('a3');
  });

  it('agregar y quitar una parada de punto', () => {
    store.addToRoute('p1');
    expect(store.routeIds()).toContain('p1');
    store.removeStop('p1');
    expect(store.routeIds()).not.toContain('p1');
  });

  it('reprogramar una entrega cambia su estado y ventana', () => {
    store.openAction('reprogramar', 'r2');
    store.onScheduleDate('2030-01-15');
    store.onScheduleSlot('11:00–14:00');
    store.confirmAction();
    const row = store.delivery('r2')!;
    expect(row.state).toBe('Reprogramado');
    expect(row.window).toBe('15/01/2030 · 11:00–14:00');
  });

  it('reprogramar con fecha pasada muestra error y no cambia la fila', () => {
    store.openAction('reprogramar', 'r2');
    store.onScheduleDate('2000-01-01');
    store.confirmAction();
    expect(store.formError()).toBe('Elige una fecha válida desde hoy.');
    expect(store.delivery('r2')!.state).toBe('Creada');
  });

  it('cancelar una entrega exige motivo y retira su parada de la ruta', () => {
    store.openAction('cancelar', 'r1');
    store.confirmAction();
    expect(store.formError()).toBe('Indica el motivo de la cancelación.');
    store.onReason('No había nadie en la dirección');
    store.confirmAction();
    expect(store.delivery('r1')!.state).toBe('Cancelado');
    expect(store.routeIds()).not.toContain('a1'); // a1 es la parada del recojo r1
  });

  it('marcar prioridad resalta la fila', () => {
    store.togglePriority('r3');
    expect(store.delivery('r3')!.priority).toBe(true);
  });

  it('el escáner valida el código de muestra', () => {
    store.openAction('qr', 'r1');
    store.onManualCode('qh-r9');
    store.confirmManual();
    expect(store.formError()).toContain('no corresponde');
    store.onManualCode('qh-r1');
    store.confirmManual();
    expect(store.delivery('r1')!.state).toBe('Completado');
    expect(store.rateOpen()).toBe(true);
  });

  it('publicar valida y agrega el anuncio al inicio de la tabla', () => {
    store.publishAd(); // falta día/horario (qty y material ya traen valores de muestra)
    expect(store.pubErrors()['window']).toBeTruthy();
    store.toggleMat('pet');
    store.setQty('12');
    store.onPubDay('Hoy');
    store.onPubTime('14:00 – 18:00');
    store.publishAd();
    expect(store.newPubs().length).toBe(1);
    expect(store.publications()[0].id).toBe('n1');
    expect(navigate).toHaveBeenCalledWith(['/app', 'publicaciones']);
  });

  it('optimizar la ruta marca el estado y deja aviso', () => {
    store.optimizeRoute();
    expect(store.optimized()).toBe(true);
    expect(store.routeNotice()).toContain('optimizada');
  });

  it('filtros del mapa: material y buscador', () => {
    store.toggleMaterial('vidrio');
    expect(store.ads().every((a) => a.mat === 'vidrio')).toBe(true);
    store.toggleMaterial('vidrio');
    store.onSearch('zzz-no-existe');
    expect(store.mapEmpty()).toBe(true);
  });

  it('notificaciones: marcar una y todas', () => {
    const before = store.unreadCount();
    expect(before).toBeGreaterThan(0);
    store.markRead('nr1');
    expect(store.unreadCount()).toBe(before - 1);
    store.markAllRead();
    expect(store.unreadCount()).toBe(0);
  });

  it('enviar un mensaje lo agrega a la conversación', () => {
    const n = store.messages().length;
    store.onDraft('Voy en camino');
    store.send();
    expect(store.messages().length).toBe(n + 1);
    expect(store.messages()[store.messages().length - 1].text).toBe('Voy en camino');
  });

  it('guardar perfil valida teléfono de 9 dígitos', () => {
    store.openEditProfile();
    store.onPfField('phone', '123');
    store.saveProfile();
    expect(store.profileErrors()['phone']).toBeTruthy();
  });

  // --- US 41-EP2: reclamo y coordinación de la recolección ---
  const pickup = (id: string) => store.pickups().find((r) => r.id === id)!;

  it('un recojo Creada ofrece Coordinar y no deja escanear el QR todavía', () => {
    const row = pickup('r2');
    expect(row.state).toBe('Creada');
    expect(row.canCoordinate).toBe(true);
    expect(row.canScan).toBe(false);
    expect(row.canStartRoute).toBe(false);
    // El QR no se abre mientras no esté coordinada.
    store.openScannerRow('r2');
    expect(store.dialog()).toBe('');
  });

  it('coordinar → iniciar recorrido → QR recorre el ciclo completo', () => {
    store.coordinate('r2');
    expect(store.dialog()).toBe('coordinar');
    store.onScheduleDate('2030-03-10');
    store.onScheduleSlot('11:00–14:00');
    store.confirmAction();
    expect(pickup('r2').state).toBe('Coordinada');
    expect(pickup('r2').canStartRoute).toBe(true);
    expect(pickup('r2').canScan).toBe(true); // ya se habilita el QR

    store.startRoute('r2');
    expect(pickup('r2').state).toBe('En camino');

    store.openScannerRow('r2');
    expect(store.dialog()).toBe('qr');
    store.onManualCode('qh-r2');
    store.confirmManual();
    expect(pickup('r2').state).toBe('Completado');
    expect(store.rateOpen()).toBe(true);
  });

  // --- US 02-EP1: límite de la nota del anuncio ---
  it('una nota que supera el límite bloquea Publicar con un error', () => {
    store.toggleMat('pet');
    store.setQty('12');
    store.onPubDay('Hoy');
    store.onPubTime('14:00 – 18:00');
    store.onNote('x'.repeat(store.noteLimit + 1));
    expect(store.noteOver()).toBe(true);
    store.publishAd();
    expect(store.errNote()).toContain('límite');
    expect(store.newPubs().length).toBe(0); // no se publicó
  });

  // --- Nota 7: un anuncio recién publicado usa el mismo menú por fila ---
  it('un anuncio recién publicado admite prioridad y reprogramación por fila', () => {
    store.role.set('generador');
    store.toggleMat('pet');
    store.setQty('10');
    store.onPubDay('Hoy');
    store.onPubTime('14:00 – 18:00');
    store.publishAd();
    const id = store.publications()[0].id;
    expect(id).toBe('n1');
    store.togglePriority(id);
    expect(store.delivery(id)!.priority).toBe(true);
    store.reschedule(id);
    expect(store.dialog()).toBe('reprogramar');
    expect(store.actionRow()).toBe(id);
    expect(store.actionDialog()).toBe(true);
  });

  // --- US 36-EP5: comprobante CSV del historial ---
  it('el historial se exporta a CSV con cabecera y una fila por actividad', () => {
    const csv = store.historyCsv();
    const lines = csv.split('\r\n');
    expect(lines[0]).toContain('Tipo');
    expect(lines.length).toBe(store.history.length + 1);
    expect(csv).toContain('Emilia Valencia');
  });

  // --- US 28-EP4: disponibilidad / visibilidad ---
  it('el interruptor de visibilidad alterna entre Activa y Oculta', () => {
    expect(store.visibilityLabel()).toBe('Activa');
    store.toggleAvailability();
    expect(store.available()).toBe(false);
    expect(store.visibilityLabel()).toBe('Oculta');
  });

  // --- US 12-EP2 / 39-EP6: reporte con evidencia ---
  it('un reporte con evidencia crea un ticket Abierto que muestra el archivo', () => {
    store.onReportText('El material no coincide con el anuncio.');
    store.onReportFile({ files: [{ name: 'foto-evidencia.jpg', type: 'text/plain' }] } as unknown as HTMLInputElement);
    store.sendReport();
    const ticket = store.ticketsView()[0];
    expect(ticket.state).toBe('Abierto');
    expect(ticket.meta).toContain('foto-evidencia.jpg');
  });

  // --- Deep links documentados (seedFromQuery) ---
  const qp = (obj: Record<string, string>) => ({ get: (k: string) => (k in obj ? obj[k] : null) });

  it('deep link del mapa: view, material y filtro', () => {
    store.seedFromQuery(qp({ view: 'puntos', material: 'pet', near: '1' }));
    expect(store.mapView()).toBe('puntos');
    expect(store.mapMaterial()).toBe('pet');
    expect(store.filters()['Cerca de mí']).toBe(true);
  });

  it('deep link de rol y de ruta vacía', () => {
    store.seedFromQuery(qp({ role: 'generador', stops: 'none' }));
    expect(store.role()).toBe('generador');
    expect(store.routeIds()).toEqual([]);
  });

  it('deep link que abre Editar perfil y un hilo de chat', () => {
    store.seedFromQuery(qp({ thread: 't2', edit: 'perfil' }));
    expect(store.thread()).toBe('t2');
    expect(store.editProfile()).toBe(true);
    expect(store.profileForm()).not.toBeNull();
  });

  it('deep link que abre el diálogo de reprogramación precargado', () => {
    store.seedFromQuery(qp({ dialog: 'reprogramar', row: 'r2', date: '2030-05-05', slot: '11:00–14:00' }));
    expect(store.dialog()).toBe('reprogramar');
    expect(store.actionRow()).toBe('r2');
    expect(store.scheduleDate()).toBe('2030-05-05');
    expect(store.scheduleSlot()).toBe('11:00–14:00');
  });

  it('deep link ignora valores desconocidos', () => {
    store.seedFromQuery(qp({ material: 'oro', role: 'jefe', view: 'galaxia' }));
    expect(store.mapMaterial()).toBe('');
    expect(store.role()).toBe('reciclador');
    expect(store.mapView()).toBe('anuncios');
  });
});
