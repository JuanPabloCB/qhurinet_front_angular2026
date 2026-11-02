import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal «Guardar ruta»: nombre obligatorio y al menos una parada. */
@Component({
  selector: 'app-save-route-dialog',
  imports: [FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flow-overlay">
      <div class="flow-dialog" appFocusTrap role="dialog" aria-modal="true" aria-label="Guardar ruta" (keydown.escape)="store.closeDialog()">
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 17px; font-weight: 600;">Guardar ruta</span><button type="button" class="flow-button" aria-label="Cerrar diálogo" (click)="store.closeDialog()">×</button></div>
        <div style="font: 11px 'IBM Plex Mono', monospace; color: #5d6b5f;">{{ store.routeMeta() }} · {{ store.routeDistance() }} · {{ store.routeMinutes() }} min</div>
        <label style="font-size: 12px; font-weight: 600;">Nombre de la ruta<input class="flow-field" aria-label="Nombre de la ruta" [value]="store.routeName()" (input)="store.onRouteName($any($event.target).value)" maxlength="60" placeholder="Ej. Recojos del sábado" /></label>
        <label style="font-size: 12px; font-weight: 600;">Descripción (opcional)<textarea class="flow-field" aria-label="Descripción (opcional)" [value]="store.routeDescription()" (input)="store.onRouteDescription($any($event.target).value)" maxlength="240" rows="3"></textarea></label>
        @if (store.formError()) { <div role="alert" style="font-size: 12px; color: #b1573f;">{{ store.formError() }}</div> }
        <div style="display: flex; gap: 8px;"><button type="button" class="flow-button flow-primary" (click)="store.saveRoute()">Confirmar guardado</button><button type="button" class="flow-button" (click)="store.closeDialog()">Volver</button></div>
      </div>
    </div>
  `,
})
export class SaveRouteDialogComponent {
  readonly store = inject(ConsoleStore);
}
