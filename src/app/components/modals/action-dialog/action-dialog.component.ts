import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal de acciones de fila: reprogramar o cancelar una recolección. */
@Component({
  selector: 'app-action-dialog',
  imports: [FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.actionDelivery(); as d) {
      <div class="flow-overlay">
        <div class="flow-dialog" appFocusTrap role="dialog" aria-modal="true" [attr.aria-label]="store.actionTitle()" (keydown.escape)="store.closeDialog()">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;"><span style="font-size: 17px; font-weight: 600;">{{ store.actionTitle() }}</span><button type="button" class="flow-button" aria-label="Cerrar diálogo" (click)="store.closeDialog()">×</button></div>
          <div style="font-size: 13px; line-height: 1.6;">{{ d.material }} · {{ d.kg }}<br />{{ d.person }}<br /><span style="color: #5d6b5f;">Ventana actual: {{ d.window }}</span></div>
          @if (store.isReschedule()) {
            <label style="font-size: 12px; font-weight: 600;">Nueva fecha<input class="flow-field" type="date" aria-label="Nueva fecha" [min]="store.today" [value]="store.scheduleDate()" (input)="store.onScheduleDate($any($event.target).value)" /></label>
            <label style="font-size: 12px; font-weight: 600;">Franja horaria<select class="flow-field" aria-label="Franja horaria" (change)="store.onScheduleSlot($any($event.target).value)">@for (t of store.timeSlots; track t) {<option [value]="t" [selected]="t === store.scheduleSlot()">{{ t }}</option>}</select></label>
          }
          @if (store.isCancel()) {
            <div style="font-size: 13px; line-height: 1.5;">¿Confirmas que deseas cancelar esta recolección? El motivo quedará visible en la fila.</div>
            <label style="font-size: 12px; font-weight: 600;">Motivo de cancelación<textarea class="flow-field" aria-label="Motivo de cancelación" [value]="store.reason()" (input)="store.onReason($any($event.target).value)" maxlength="240" rows="3" placeholder="Indica por qué necesitas cancelarla"></textarea></label>
          }
          @if (store.lockedAction()) { <div role="status" style="font-size: 12px; color: #5d6b5f;">Esta recolección ya está cerrada y no admite cambios de fecha ni cancelación.</div> }
          @if (store.formError()) { <div role="alert" style="font-size: 12px; color: #b1573f;">{{ store.formError() }}</div> }
          <div style="display: flex; gap: 8px;"><button type="button" class="flow-button flow-primary" [disabled]="store.lockedAction()" (click)="store.confirmAction()">Confirmar</button><button type="button" class="flow-button" (click)="store.closeDialog()">Volver</button></div>
        </div>
      </div>
    }
  `,
})
export class ActionDialogComponent {
  readonly store = inject(ConsoleStore);
}
