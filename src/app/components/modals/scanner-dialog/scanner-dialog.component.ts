import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal «Confirmar entrega» (escáner QR). Sin cámara: valida el código de
 *  muestra. Lo ve solo el reciclador. */
@Component({
  selector: 'app-scanner-dialog',
  imports: [FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.actionDelivery(); as d) {
      <div style="position: fixed; inset: 0; background: rgba(22,40,31,0.62); display: flex; align-items: center; justify-content: center; z-index: 60;">
        <div role="dialog" appFocusTrap aria-modal="true" aria-label="Confirmar entrega" (keydown.escape)="store.closeScanner()" style="max-height: calc(100vh - 32px); overflow-y: auto; width: 420px; background: #ffffff; border-radius: 16px; overflow-x: hidden;">
          <div style="background: #16281f; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; color: #a3d24a;">CONFIRMAR ENTREGA</div>
              <div style="font-size: 15px; font-weight: 600; color: #ffffff; margin-top: 5px;">{{ store.scannerTitle() }}</div>
            </div>
            <div (click)="store.closeScanner()" title="Cerrar" style="color: #8fa392; font-size: 20px; cursor: pointer; line-height: 1;">×</div>
          </div>
          <div style="padding: 24px 22px;">
            <div style="position: relative; height: 220px; border-radius: 12px; background: #16281f; display: flex; align-items: center; justify-content: center;">
              <svg viewBox="0 0 60 60" style="width: 130px; height: 130px; color: #a3d24a;">
                <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="4"></rect>
                <rect x="40" y="4" width="16" height="16" fill="none" stroke="currentColor" stroke-width="4"></rect>
                <rect x="4" y="40" width="16" height="16" fill="none" stroke="currentColor" stroke-width="4"></rect>
                <rect x="28" y="28" width="6" height="6" fill="currentColor"></rect>
                <rect x="40" y="28" width="6" height="6" fill="currentColor"></rect>
                <rect x="28" y="40" width="6" height="6" fill="currentColor"></rect>
                <rect x="40" y="46" width="6" height="6" fill="currentColor"></rect>
                <rect x="28" y="16" width="6" height="6" fill="currentColor"></rect>
                <rect x="16" y="28" width="6" height="6" fill="currentColor"></rect>
              </svg>
              <div style="position: absolute; left: 24px; top: 24px; width: 26px; height: 26px; border-left: 3px solid #a3d24a; border-top: 3px solid #a3d24a;"></div>
              <div style="position: absolute; right: 24px; top: 24px; width: 26px; height: 26px; border-right: 3px solid #a3d24a; border-top: 3px solid #a3d24a;"></div>
              <div style="position: absolute; left: 24px; bottom: 24px; width: 26px; height: 26px; border-left: 3px solid #a3d24a; border-bottom: 3px solid #a3d24a;"></div>
              <div style="position: absolute; right: 24px; bottom: 24px; width: 26px; height: 26px; border-right: 3px solid #a3d24a; border-bottom: 3px solid #a3d24a;"></div>
            </div>
            <div style="font-size: 12.5px; color: #3d4a3f; text-align: center; margin-top: 16px; line-height: 1.55;">Apunta al código que muestra el generador. Al confirmar se registra la entrega y podrán valorarse.</div>
            <div style="display: flex; gap: 8px; margin-top: 18px;">
              <button type="button" [disabled]="store.lockedAction()" class="map-button" (click)="store.confirmDelivery()" style="border: none; flex: 1; background: #a3d24a; color: #16281f; font-size: 13.5px; font-weight: 600; text-align: center; padding: 12px; border-radius: 8px; cursor: pointer;">Confirmar entrega</button>
              <div (click)="store.closeScanner()" style="border: 1px solid #d8dcd2; border-radius: 8px; padding: 12px 18px; font-size: 13px; cursor: pointer;">Cancelar</div>
            </div>
            <div style="font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: #8b9186; text-align: center; margin-top: 12px;">O INGRESA EL CÓDIGO MANUALMENTE</div>
            <label style="display: block; font-size: 12px; margin-top: 12px;">Código de entrega<input class="flow-field" aria-label="Código de entrega" [value]="store.manualCode()" (input)="store.onManualCode($any($event.target).value)" (keydown.enter)="store.confirmManual()" placeholder="Ej. QH-R2" maxlength="24" /></label>
            <div style="font-size: 11px; color: #5d6b5f; margin-top: 7px;">Código de muestra para esta entrega: {{ d.code }}</div>
            @if (store.formError()) { <div role="alert" style="font-size: 12px; color: #b1573f; margin-top: 10px;">{{ store.formError() }}</div> }
            @if (store.lockedAction()) { <div role="status" style="font-size: 12px; color: #5d6b5f; margin-top: 10px;">Esta entrega ya está {{ d.state }}.</div> }
            <button type="button" class="flow-button" [disabled]="store.lockedAction()" (click)="store.confirmManual()" style="width: 100%; margin-top: 12px;">Confirmar con código</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ScannerDialogComponent {
  readonly store = inject(ConsoleStore);
}
