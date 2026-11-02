import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../services/console-store';
import { DeliveryTableComponent } from '../delivery-table/delivery-table.component';

/** Pantalla Anuncios del generador: tabla de publicaciones + resumen del mes. */
@Component({
  selector: 'app-publications',
  imports: [DeliveryTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.css',
})
export class PublicationsComponent {
  readonly store = inject(ConsoleStore);
}
