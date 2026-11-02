import { Pipe, PipeTransform, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TRUSTED_SVG } from '../model/icon-registry';

/**
 * Inyecta con [innerHTML] los íconos SVG ESTÁTICOS Y CONOCIDOS de la app
 * (model/icons.ts, materiales y tipos de punto), equivalente seguro al
 * dangerouslySetInnerHTML del prototipo.
 *
 * Seguridad: solo marca como confiable el SVG que figura en la lista blanca
 * `TRUSTED_SVG`. Nunca confía automáticamente en HTML/SVG arbitrario ni en
 * entrada del usuario: una cadena desconocida se entrega como texto escapado
 * por el sanitizador de Angular (no se interpreta como markup).
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    if (typeof value === 'string' && TRUSTED_SVG.has(value)) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }
    // Cadena no reconocida: la sanea (se escapa), nunca se confía a ciegas.
    return this.sanitizer.sanitize(SecurityContext.HTML, value ?? '') ?? '';
  }
}
