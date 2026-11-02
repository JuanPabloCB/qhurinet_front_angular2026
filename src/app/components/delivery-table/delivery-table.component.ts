import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ConsoleStore, DeliveryRow } from '../../services/console-store';

/**
 * Tabla de entregas compartida por Recojos (reciclador) y Anuncios (generador).
 * El modo cambia encabezados y el ícono central (QR en recojos, Ver anuncio en
 * anuncios), igual que en el prototipo.
 */
@Component({
  selector: 'app-delivery-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delivery-table.component.html',
  styleUrl: './delivery-table.component.css',
})
export class DeliveryTableComponent {
  readonly store = inject(ConsoleStore);
  readonly rows = input.required<DeliveryRow[]>();
  readonly mode = input.required<'recojos' | 'anuncios'>();
  readonly activeCount = input.required<number>();
  readonly completedText = input.required<string>();
  readonly canceledCount = input.required<number>();
}
