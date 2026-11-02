import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../services/console-store';
import { SafeHtmlPipe } from '../../shared/safe-html.pipe';

/** Pantalla Mapa del reciclador: lista (anuncios/puntos), filtros, pines,
 *  ruta activa, leyenda, rutas guardadas y detalle de punto. */
@Component({
  selector: 'app-map',
  imports: [SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent {
  readonly store = inject(ConsoleStore);
}
