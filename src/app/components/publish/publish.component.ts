import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../services/console-store';
import { SafeHtmlPipe } from '../../shared/safe-html.pipe';

/** Pantalla Publicar del generador: formulario de anuncio con vista previa. */
@Component({
  selector: 'app-publish',
  imports: [SafeHtmlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './publish.component.html',
  styleUrl: './publish.component.css',
})
export class PublishComponent {
  readonly store = inject(ConsoleStore);
}
