import { svg, ICONS } from './icons';

// Puntos fijos de reciclaje y sus tipos. Datos de muestra del prototipo.

export type PointTypeKey = 'acopio' | 'bodega' | 'reciclador' | 'municipal';

export interface PointTypeInfo {
  readonly label: string;
  readonly icon: string;
}

export interface RecyclingPoint {
  readonly id: string;
  readonly name: string;
  readonly type: PointTypeKey;
  readonly address: string;
  readonly district: string;
  readonly x: number;
  readonly y: number;
  readonly hours: string;
  readonly rating: number;
  readonly distance: number;
  readonly materials: string[];
}

export const POINT_TYPES: Record<PointTypeKey, PointTypeInfo> = {
  acopio: { label: 'Centro de acopio', icon: svg('<path d="M3 10 L12 4 L21 10 V20 H3 Z"/><path d="M8 20 V13 H16 V20"/>') },
  bodega: { label: 'Comercio o bodega', icon: svg('<path d="M4 10 H20 L18 5 H6 Z M5 10 V20 H19 V10 M9 20 V14 H15 V20"/>') },
  reciclador: { label: 'Reciclador', icon: ICONS['perfil'] },
  municipal: { label: 'Punto municipal', icon: svg('<path d="M4 9 L12 4 L20 9 Z M6 11 V18 M12 11 V18 M18 11 V18 M4 20 H20"/>') },
};

export const POINT_TYPE_KEYS = Object.keys(POINT_TYPES) as PointTypeKey[];

export const RECYCLING_POINTS: readonly RecyclingPoint[] = [
  { id: 'p1', name: 'Acopio Verde Magdalena', type: 'acopio', address: 'Av. Brasil 2860', district: 'Magdalena del Mar', x: 17, y: 14, hours: 'Lun–sáb · 08:00–18:00', rating: 4.8, distance: 1.4, materials: ['carton', 'pet', 'vidrio', 'metal', 'plastico'] },
  { id: 'p2', name: 'Bodega Las Palmeras', type: 'bodega', address: 'Av. Dos de Mayo 620', district: 'San Isidro', x: 48, y: 12, hours: 'Lun–dom · 07:00–21:00', rating: 4.5, distance: 2.1, materials: ['carton', 'pet'] },
  { id: 'p3', name: 'Reciclador El Progreso', type: 'reciclador', address: 'Jr. Risso 410', district: 'Lince', x: 82, y: 16, hours: 'Lun–sáb · 09:00–17:00', rating: 4.7, distance: 3.2, materials: ['carton', 'metal', 'plastico'] },
  { id: 'p4', name: 'Punto Verde Jesús María', type: 'municipal', address: 'Av. Salaverry 1200', district: 'Jesús María', x: 17, y: 43, hours: 'Lun–dom · 08:00–20:00', rating: 4.6, distance: 2.7, materials: ['pet', 'vidrio', 'plastico'] },
  { id: 'p5', name: 'Acopio Circular Pueblo Libre', type: 'acopio', address: 'Av. La Marina 850', district: 'Pueblo Libre', x: 83, y: 45, hours: 'Lun–sáb · 08:30–17:30', rating: 4.9, distance: 3.8, materials: ['carton', 'pet', 'metal'] },
  { id: 'p6', name: 'Bodega La Esquina Verde', type: 'bodega', address: 'Av. Universitaria 540', district: 'San Miguel', x: 19, y: 73, hours: 'Lun–dom · 08:00–22:00', rating: 4.3, distance: 4.9, materials: ['vidrio', 'plastico'] },
  { id: 'p7', name: 'Reciclador Surquillo Limpio', type: 'reciclador', address: 'Av. Angamos Este 1050', district: 'Surquillo', x: 49, y: 74, hours: 'Lun–sáb · 07:00–16:00', rating: 4.7, distance: 6.2, materials: ['carton', 'pet', 'metal', 'plastico'] },
  { id: 'p8', name: 'Punto Municipal Miraflores', type: 'municipal', address: 'Av. La Paz 900', district: 'Miraflores', x: 83, y: 94, hours: 'Mar–dom · 09:00–19:00', rating: 4.8, distance: 5.6, materials: ['carton', 'pet', 'vidrio'] },
];
