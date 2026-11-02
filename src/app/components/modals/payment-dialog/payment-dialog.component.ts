import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal «Agregar método de pago»: Yape, Plin, tarjeta, transferencia o efectivo. */
@Component({
  selector: 'app-payment-dialog',
  imports: [FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flow-overlay">
      <div class="flow-dialog" appFocusTrap role="dialog" aria-modal="true" aria-label="Agregar método de pago" (keydown.escape)="store.closePay()">
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 17px; font-weight: 600;">Agregar método de pago</span><button type="button" class="flow-button" aria-label="Cerrar diálogo" (click)="store.closePay()">×</button></div>
        <div>
          <div class="flow-heading">MEDIO</div>
          <div role="radiogroup" aria-label="Medio de pago" style="display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px;">
            @for (k of store.payKindChips(); track k.key) {
              <button type="button" role="radio" (click)="store.selectPayKind(k.key)" style="font: inherit; font-size: 12px; padding: 7px 13px; border-radius: 8px; cursor: pointer;" [style.background]="k.bg" [style.color]="k.fg" [style.border]="'1px solid ' + k.border">{{ k.label }}</button>
            }
          </div>
        </div>
        @if (store.payHasField()) {
          <label style="display: block; font-size: 12px; font-weight: 600;">{{ store.payFieldLabel() }}<input class="flow-field" [attr.aria-label]="store.payFieldLabel()" [value]="store.payDetail()" (input)="store.onPayDetail($any($event.target).value)" [placeholder]="store.payPlaceholder()" maxlength="40" /></label>
        } @else {
          <div style="font-size: 12.5px; color: #5d6b5f; line-height: 1.5;">El pago en efectivo se acuerda en el chat y se entrega al momento del recojo.</div>
        }
        <button type="button" role="checkbox" [attr.aria-checked]="store.payAsDefault()" (click)="store.togglePayDefault()" style="font: inherit; display: flex; align-items: center; gap: 10px; background: none; border: none; padding: 0; cursor: pointer; font-size: 12.5px; color: #16281f;"><span style="width: 18px; height: 18px; border-radius: 5px; border: 1px solid #16281f; color: #a3d24a; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;" [style.background]="store.payCheckBg()">{{ store.payCheckMark() }}</span>Usar como método predeterminado</button>
        @if (store.payError()) { <div role="alert" style="font-size: 12px; color: #b1573f;">{{ store.payError() }}</div> }
        <div style="display: flex; gap: 8px;"><button type="button" class="flow-button flow-primary" (click)="store.savePayMethod()">Guardar método</button><button type="button" class="flow-button" (click)="store.closePay()">Cancelar</button></div>
      </div>
    </div>
  `,
})
export class PaymentDialogComponent {
  readonly store = inject(ConsoleStore);
}
