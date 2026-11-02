// Biblioteca de íconos SVG embebidos, espejo de public/images/* y del prototipo
// (referencia-html/index.html). Se inyectan con [innerHTML] + SafeHtmlPipe,
// equivalente al dangerouslySetInnerHTML del prototipo. Usan currentColor.

/** Envuelve un trazo en el <svg> estándar de los íconos (grosor 1,7, redondeado). */
export const svg = (d: string): string =>
  '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" ' +
  'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
  d +
  '</svg>';

/** Íconos de las pestañas de navegación (24×24, grosor 1,8). */
export const ICONS: Record<string, string> = {
  mapa: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6.5 L9.5 4 L15 6.5 L21 4 V17.5 L15 20 L9.5 17.5 L3 20 Z M9.5 4 V17.5 M15 6.5 V20"/></svg>',
  recojos: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6 H20 M4 12 H20 M4 18 H14"/></svg>',
  chats: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5 H21 V16 H12 L7 20 V16 H3 Z"/></svg>',
  publicaciones: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M8 8.5 H16 M8 12 H16 M8 15.5 H12.5"/></svg>',
  publicar: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 5 V19 M5 12 H19"/></svg>',
  perfil: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20 C5.5 15.5 8.5 14 12 14 C15.5 14 18.5 15.5 19.5 20"/></svg>',
  soporte: '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5 A2.5 2.5 0 1 1 12 13 V14.5"/><circle cx="12" cy="17.5" r="0.9" fill="currentColor" stroke="none"/></svg>',
};
