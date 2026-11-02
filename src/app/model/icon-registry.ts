import { ICONS } from './icons';
import { MATERIALS } from './material.model';
import { POINT_TYPES } from './point.model';

/**
 * Lista blanca de TODO el SVG estático y de confianza de la app: íconos de
 * navegación, de materiales y de tipos de punto. SafeHtmlPipe solo marca como
 * seguro lo que está aquí; cualquier otra cadena (p. ej. entrada de usuario) se
 * rechaza. Es un conjunto congelado, construido una sola vez al cargar.
 */
export const TRUSTED_SVG: ReadonlySet<string> = Object.freeze(
  new Set<string>([
    ...Object.values(ICONS),
    ...Object.values(MATERIALS).map((m) => m.icon),
    ...Object.values(POINT_TYPES).map((p) => p.icon),
  ]),
) as ReadonlySet<string>;
