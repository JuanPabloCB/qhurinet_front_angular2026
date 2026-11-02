import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../services/console-store';

/** Pantalla Chats (ambos roles): hilos, conversación y panel de entrega. */
@Component({
  selector: 'app-chats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css',
})
export class ChatsComponent {
  readonly store = inject(ConsoleStore);
}
