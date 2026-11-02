import { POINT_TYPES, RECYCLING_POINTS } from './point.model';

// Anuncios de material del mapa y geometría de la ruta (coordenadas relativas).

export interface Ad {
  readonly id: string;
  readonly kg: string;
  readonly mat: string;
  readonly material: string;
  readonly place: string;
  readonly dist: string;
  readonly eta: string;
  readonly window: string;
}

export interface RouteLocation {
  readonly id: string;
  readonly name: string;
  readonly detail: string;
  readonly x: number;
  readonly y: number;
  readonly kg: number;
  readonly pickup?: string | null;
}

export interface SavedRoute {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  stops: string[];
}

// a1 y a2 nacen reclamados: son las dos paradas de la ruta activa y de Mis recojos.
export const ADS: readonly Ad[] = [
  { id: 'a1', kg: '24 kg', mat: 'carton', material: 'Cartón plegado', place: 'Minimarket H&J · Av. Pershing 345, Magdalena', dist: '1,2 KM', eta: '~9 MIN', window: 'HOY 14:00–18:00' },
  { id: 'a2', kg: '8,5 kg', mat: 'pet', material: 'Botellas PET', place: 'Bodega Olivo · Jr. Cuba 195, San Isidro', dist: '2,4 KM', eta: '~15 MIN', window: 'MAÑ 09:00' },
  { id: 'a3', kg: '31 kg', mat: 'vidrio', material: 'Vidrio mixto', place: 'Rest. La Huerta · Av. Arenales 1200, Lince', dist: '3,9 KM', eta: '~22 MIN', window: 'HOY 19:00' },
  { id: 'a4', kg: '6 kg', mat: 'metal', material: 'Latas de aluminio', place: 'Café Arenales · Av. Petit Thouars 2100, Lince', dist: '4,3 KM', eta: '~26 MIN', window: 'MAÑ 11:00' },
];

// Una misma geometría alimenta pines, trazo, optimización y métricas simuladas.
export const ROUTE_ORIGIN = { x: 12, y: 92 };

const AD_XS = [48, 68, 83, 49];
const AD_YS = [40, 29, 72, 95];
const AD_PICKUPS: (string | null)[] = ['r1', 'r2', null, null];

export const ROUTE_LOCATIONS: readonly RouteLocation[] = [
  ...ADS.map((a, i) => ({
    id: a.id,
    name: a.place.split(' · ')[0],
    detail: a.material,
    x: AD_XS[i],
    y: AD_YS[i],
    kg: parseFloat(a.kg.replace(',', '.')),
    pickup: AD_PICKUPS[i],
  })),
  ...RECYCLING_POINTS.map((p) => ({
    id: p.id,
    name: p.name,
    detail: POINT_TYPES[p.type].label + ' · ' + p.district,
    x: p.x,
    y: p.y,
    kg: 0,
  })),
];

export const SAVED_ROUTES: readonly SavedRoute[] = [
  { id: 'centro', name: 'Circuito Lima Centro', description: 'Recojos y puntos de Lince y Jesús María.', stops: ['a1', 'a2', 'p4', 'p3'] },
  { id: 'costa', name: 'Acopios de la costa', description: 'Magdalena, Pueblo Libre y San Miguel.', stops: ['p1', 'p5', 'p6'] },
  { id: 'sur', name: 'Reciclaje Lima Sur', description: 'Miraflores y Surquillo.', stops: ['p8', 'p7'] },
];
