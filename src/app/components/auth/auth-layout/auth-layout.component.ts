import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrandLogoComponent } from '../../brand-logo/brand-logo.component';

/**
 * Marco de la pantalla de acceso: panel izquierdo oscuro con la marca y el lema,
 * y a la derecha el formulario (login o registro) proyectado por el router.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, BrandLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {}
