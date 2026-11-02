import { svg } from './icons';

// Catálogo de materiales, espejo de public/images/materials/* y del prototipo.
// Cada material tiene color de chip, color de trazo del ícono (fg) e ícono SVG.

export interface Material {
  readonly label: string;
  readonly color: string;
  readonly fg: string;
  readonly icon: string;
}

export const MATERIALS: Record<string, Material> = {
  carton: { label: 'Cartón', color: '#e8b53a', fg: '#16281f', icon: svg('<path d="M12 4.2 L20.3 8.1 V16 L12 19.9 L3.7 16 V8.1 Z"/><path d="M3.7 8.1 L12 12 L20.3 8.1"/><path d="M12 12 V19.9"/><path d="M7.8 6.15 L16.2 10.05"/>') },
  papel: { label: 'Papel', color: '#c98f3c', fg: '#16281f', icon: svg('<path d="M6.2 3.6 H13.8 L18.4 8.2 V20.4 H6.2 Z"/><path d="M13.8 3.6 V8.2 H18.4"/><path d="M9 12.6 H15.4"/><path d="M9 16 H13.2"/>') },
  pet: { label: 'PET', color: '#4c7a2f', fg: '#ffffff', icon: svg('<path d="M10 3.6 H14 V5.8 C14 7.1 16 7.9 16 11 V18.8 A1.6 1.6 0 0 1 14.4 20.4 H9.6 A1.6 1.6 0 0 1 8 18.8 V11 C8 7.9 10 7.1 10 5.8 Z"/><path d="M8 12.8 H16"/><path d="M8 15.2 H16"/>') },
  vidrio: { label: 'Vidrio', color: '#5b7f9e', fg: '#ffffff', icon: svg('<path d="M9 3.6 H15 V7.2 L17 10.2 V18.8 A1.6 1.6 0 0 1 15.4 20.4 H8.6 A1.6 1.6 0 0 1 7 18.8 V10.2 L9 7.2 Z"/><path d="M7 12.6 H17"/>') },
  metal: { label: 'Metal', color: '#b1573f', fg: '#ffffff', icon: svg('<ellipse cx="12" cy="5.8" rx="4.8" ry="2.2"/><path d="M7.2 5.8 V18.2 A4.8 2.2 0 0 0 16.8 18.2 V5.8"/><path d="M7.2 9.6 H16.8"/>') },
  electronicos: { label: 'Electrónicos', color: '#6b5b95', fg: '#ffffff', icon: svg('<rect x="7.2" y="7.2" width="9.6" height="9.6" rx="1.6"/><rect x="10.2" y="10.2" width="3.6" height="3.6" rx="0.6"/><path d="M9.8 7.2 V4.2 M14.2 7.2 V4.2 M9.8 16.8 V19.8 M14.2 16.8 V19.8 M7.2 9.8 H4.2 M7.2 14.2 H4.2 M16.8 9.8 H19.8 M16.8 14.2 H19.8"/>') },
  organico: { label: 'Orgánico', color: '#7a8f3f', fg: '#ffffff', icon: svg('<path d="M4.6 19.4 C4.6 11.4 10.8 5.2 19.4 4.6 C19.4 13 13 19.4 4.6 19.4 Z"/><path d="M4.6 19.4 C8.4 15.2 12.6 12.2 16.8 10.2"/>') },
};

// Plástico comparte el ícono de PET (mismo trazo que el prototipo).
MATERIALS['plastico'] = { label: 'Plástico', color: '#4c7a2f', fg: '#ffffff', icon: MATERIALS['pet'].icon };

/** Orden de los chips de material en Publicar. */
export const MAT_ORDER = ['carton', 'pet', 'vidrio', 'metal', 'plastico'] as const;

/** Materiales usados como filtro en el mapa. */
export const MAP_MATERIALS = ['carton', 'pet', 'vidrio', 'metal', 'plastico'] as const;
