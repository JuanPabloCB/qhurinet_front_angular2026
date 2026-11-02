// Entregas: recojos (reciclador) y publicaciones (generador). Misma forma para
// que el menú de acciones y las actualizaciones por fila funcionen igual.

export interface Delivery {
  readonly id: string;
  readonly thread: string;
  readonly code?: string;
  readonly address?: string;
  kg: string;
  material: string;
  readonly place?: string;
  readonly posted?: string;
  person: string;
  readonly personFg?: string;
  window: string;
  state: string;
  stateBg: string;
  stateFg: string;
  // Campos añadidos por las actualizaciones por fila (rowUpdates):
  priority?: boolean;
  date?: string;
  slot?: string;
  reason?: string;
}

/** Cambios confirmados por fila (reprogramar, cancelar, prioridad, completar). */
export interface RowUpdate {
  priority?: boolean;
  state?: string;
  date?: string;
  slot?: string;
  reason?: string;
}

export const PICKUPS: readonly Delivery[] = [
  { id: 'r1', thread: 't1', code: 'QH-R1', kg: '24 kg', material: 'Cartón plegado', place: 'Minimarket H&J · Magdalena', person: 'Juan Flores', window: 'HOY 14:00–18:00', state: 'En camino', stateBg: '#eef2e4', stateFg: '#3f6224' },
  { id: 'r2', thread: 't2', code: 'QH-R2', kg: '8,5 kg', material: 'Botellas PET', place: 'Bodega Olivo · San Isidro', person: 'Camila Salazar', window: 'Por coordinar', state: 'Creada', stateBg: '#fdf3dd', stateFg: '#8a6a1f' },
  { id: 'r3', thread: 't3', code: 'QH-R3', kg: '9 kg', material: 'Bolsas de plástico', place: 'Casa · Jesús María', person: 'Emilia Valencia', window: 'AYER 17:00', state: 'Completado', stateBg: '#eef2e4', stateFg: '#3f6224' },
  { id: 'r4', thread: 't3', code: 'QH-R4', kg: '14 kg', material: 'Vidrio mixto', place: 'Rest. La Huerta · Lince', person: 'Camila Salazar', window: 'HACE 2 D', state: 'Completado', stateBg: '#eef2e4', stateFg: '#3f6224' },
];

export const PUBLICATIONS: readonly Delivery[] = [
  { id: 'g1', thread: 't1', address: 'Av. Pershing 345, Magdalena', kg: '30 kg', material: 'Cartón plegado', posted: 'Publicado hace 2 h', person: 'Marco Quispe', personFg: '#3d4a3f', window: 'HOY 14:00–18:00', state: 'En camino', stateBg: '#eef2e4', stateFg: '#3f6224' },
  { id: 'g2', thread: 't2', address: 'Av. Salaverry 820, Jesús María', kg: '12 kg', material: 'Papel de oficina', posted: 'Publicado hace 5 h', person: 'Rosa Huamán', personFg: '#3d4a3f', window: 'HOY 16:00–19:00', state: 'Reclamado', stateBg: '#eceee7', stateFg: '#5d6b5f' },
  { id: 'g3', thread: 't3', address: 'Jr. Cuba 195, San Isidro', kg: '6 kg', material: 'Botellas PET', posted: 'Publicado ayer', person: 'Sin reclamar', personFg: '#8b9186', window: 'MAÑ 09:00', state: 'Esperando', stateBg: '#fdf3dd', stateFg: '#8a6a1f' },
  { id: 'g4', thread: 't3', address: 'Av. Arenales 1200, Lince', kg: '18 kg', material: 'Vidrio mixto', posted: 'Publicado hace 3 d', person: 'Luis Ttito', personFg: '#3d4a3f', window: 'HACE 2 D', state: 'Completado', stateBg: '#eef2e4', stateFg: '#3f6224' },
];

export const TIME_SLOTS = ['08:00–11:00', '11:00–14:00', '14:00–18:00', '18:00–21:00'] as const;

/** Un anuncio publicado desde el formulario (tab Publicar). */
export interface NewPub {
  id: string;
  mats: string[];
  kg: string;
  window: string;
  pay: string;
  note: string;
}

/** Los ids de recojos empiezan por "r"; los de anuncios por "g"/"n". */
export const rowRole = (id: string): 'reciclador' | 'generador' =>
  id.startsWith('r') ? 'reciclador' : 'generador';
