// Soporte: preguntas frecuentes, tickets, categorías y reglas de sugerencia.

export interface Faq {
  readonly q: string;
  readonly a: string;
}

export const FAQ_DATA: readonly Faq[] = [
  { q: '¿Cómo reclamo un material del mapa?', a: 'Abre el anuncio desde el mapa o la lista y pulsa Reclamar. El material queda reservado para ti y el generador recibe un aviso en su chat. Si ya tienes otras paradas, la ruta se recalcula para incluir la nueva.' },
  { q: '¿Qué pasa si el generador no está cuando llego?', a: 'Escríbele por el chat y espera hasta 15 minutos. Si no responde, marca el recojo como no concretado desde Mis recojos; el caso queda registrado y no afecta tu cumplimiento.' },
  { q: '¿Cómo funciona la confirmación por QR?', a: 'Al llegar, el generador muestra su código en la app y tú lo escaneas desde la entrega en curso. Con el escaneo se registra el peso final y se habilita la valoración mutua.' },
  { q: '¿Cómo sé quién va a recoger mi material?', a: 'Cuando un reciclador reclama tu anuncio, la publicación pasa a Reclamado en Mis publicaciones y se abre un chat con él. Ahí acuerdan la hora exacta, y antes de que llegue puedes ver su valoración y si está verificado.' },
  { q: '¿Cuándo debo llamar a soporte?', a: 'Usa la llamada 24/7 solo para situaciones extremas: riesgo de seguridad, suplantación de identidad o incumplimientos graves. Los demás casos se resuelven más rápido con un reporte escrito.' },
];

export interface Ticket {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly state: string;
  readonly evidence?: boolean;
  readonly evidenceName?: string;
}

export const TICKETS: readonly Ticket[] = [
  { id: '#4821', title: 'Material distinto al anunciado', category: 'Material distinto', state: 'Resuelto' },
  { id: '#4903', title: 'No pudo confirmar el QR', category: 'Error en la app', state: 'En revisión' },
];

export const TICKET_STATES: Record<string, readonly [string, string]> = {
  Abierto: ['#e7edf3', '#3d5a73'],
  'En revisión': ['#fdf3dd', '#8a6a1f'],
  Resuelto: ['#eef2e4', '#3f6224'],
};

export const REPORT_CATEGORIES = ['Incumplimiento', 'Material distinto', 'Error en la app'] as const;

export const PAY_OPTIONS = ['Sin pago', 'Yape', 'Efectivo'] as const;

// Sugerencia de material por palabras clave: simula el clasificador del sistema.
export interface SuggestRule {
  readonly mat: string;
  readonly confidence: number;
  readonly keys: string[];
}

export const SUGGEST_RULES: readonly SuggestRule[] = [
  { mat: 'carton', confidence: 92, keys: ['carton', 'caja', 'cajas', 'corrugado'] },
  { mat: 'pet', confidence: 90, keys: ['botella', 'botellas', 'pet', 'gaseosa'] },
  { mat: 'vidrio', confidence: 91, keys: ['vidrio', 'frasco', 'frascos', 'vino', 'cerveza'] },
  { mat: 'metal', confidence: 86, keys: ['lata', 'latas', 'metal', 'aluminio', 'fierro', 'chatarra'] },
  { mat: 'plastico', confidence: 85, keys: ['plastico', 'bolsa', 'bolsas', 'envase', 'envases', 'tapa', 'tapas'] },
];
