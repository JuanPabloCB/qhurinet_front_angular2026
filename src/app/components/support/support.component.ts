import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../services/console-store';

/** Pantalla Soporte (ambos roles): FAQ, llamada, reporte y tickets. */
@Component({
  selector: 'app-support',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  readonly store = inject(ConsoleStore);
}
