import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/**
 * Control de foco accesible para modales y paneles. Al abrirse: recuerda el
 * elemento que tenía el foco (el que abrió el diálogo) y mueve el foco al primer
 * control del diálogo. Mientras está abierto: atrapa Tab/Shift+Tab dentro del
 * diálogo. Al cerrarse: devuelve el foco al elemento que lo abrió.
 *
 * Escape lo maneja cada modal (cierra), igual que `modalKey` en el prototipo.
 */
@Directive({
  selector: '[appFocusTrap]',
  host: { '(keydown.Tab)': 'onTab($event)', '(keydown.shift.Tab)': 'onTab($event)' },
})
export class FocusTrapDirective implements OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly opener = document.activeElement as HTMLElement | null;

  constructor() {
    afterNextRender(() => {
      const first = this.focusable()[0];
      (first ?? this.host.nativeElement).focus({ preventScroll: true });
    });
  }

  private focusable(): HTMLElement[] {
    return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE));
  }

  protected onTab(event: Event): void {
    const e = event as KeyboardEvent;
    const items = this.focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    this.opener?.focus?.({ preventScroll: true });
  }
}
