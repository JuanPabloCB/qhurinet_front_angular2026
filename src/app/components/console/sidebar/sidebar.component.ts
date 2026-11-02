import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsoleStore } from '../../../services/console-store';
import { SafeHtmlPipe } from '../../../shared/safe-html.pipe';
import { BrandLogoComponent } from '../../brand-logo/brand-logo.component';

/** Barra lateral de 88 px: marca, pestañas del rol, botón MODO y avatar. */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, SafeHtmlPipe, BrandLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  readonly store = inject(ConsoleStore);
}
