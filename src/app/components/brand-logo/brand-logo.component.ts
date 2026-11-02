import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Marca de QhuriNet: anillo abierto que se lee como «Q» y como ciclo de
 * reciclaje, con el nodo de red arriba. Trazo idéntico al del prototipo.
 */
@Component({
  selector: 'app-brand-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 64 64"
      [style.width.px]="size()"
      [style.height.px]="size()"
      style="flex: none;"
      role="img"
      aria-label="QhuriNet"
    >
      <rect width="64" height="64" rx="14" fill="#a3d24a" />
      <g fill="none" stroke="#16281f" stroke-width="5" stroke-linecap="round">
        <path d="M34.43 43.79 A14 14 0 1 1 45.79 32.43" />
        <path d="M36.5 36.5 L47 47" />
      </g>
      <circle cx="32" cy="16" r="3.2" fill="#16281f" />
    </svg>
  `,
})
export class BrandLogoComponent {
  readonly size = input(40);
}
