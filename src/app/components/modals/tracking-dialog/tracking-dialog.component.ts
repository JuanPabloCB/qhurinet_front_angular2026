import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { SafeHtmlPipe } from '../../../shared/safe-html.pipe';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal «Seguimiento del recolector»: marcador que avanza con ETA simulada.
 *  El recorrido es dibujado; no hay geolocalización. */
@Component({
  selector: 'app-tracking-dialog',
  imports: [SafeHtmlPipe, FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.tracked(); as t) {
      <div class="flow-overlay">
        <div class="flow-dialog" appFocusTrap role="dialog" aria-modal="true" aria-label="Seguimiento del recolector" (keydown.escape)="store.closeTracking()" style="width: 900px;">
          <div style="display: flex; justify-content: space-between; align-items: center;"><div><div class="flow-heading">SEGUIMIENTO DEL RECOLECTOR</div><div style="font-size: 17px; font-weight: 600; margin-top: 6px;">{{ t.person }}</div></div><button type="button" class="flow-button" aria-label="Cerrar seguimiento" (click)="store.closeTracking()">×</button></div>
          <div style="display: flex; justify-content: space-between; gap: 24px; font-size: 13px;"><div><div role="status" style="font-weight: 600;">{{ statusLabel() }}</div><div style="color: #5d6b5f; margin-top: 6px;">Destino: {{ t.address }}</div></div><div style="text-align: right;"><div style="font: 22px 'IBM Plex Mono', monospace;">{{ eta() }} min</div><div style="font-size: 11px; color: #5d6b5f;">Llegada estimada</div></div></div>
          <div style="position: relative; height: 360px; flex: none; border: 1px solid #e2e5dc; border-radius: 12px; overflow: hidden; background: #e7ebe1;">
            <svg viewBox="0 0 1000 700" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%;">
              <rect x="40" y="40" width="200" height="180" rx="6" fill="#dde3d5"></rect><rect x="300" y="40" width="300" height="180" rx="6" fill="#dde3d5"></rect><rect x="660" y="40" width="300" height="200" rx="6" fill="#d5e0cb"></rect>
              <rect x="40" y="280" width="200" height="360" rx="6" fill="#dde3d5"></rect><rect x="300" y="280" width="300" height="360" rx="6" fill="#dde3d5"></rect><rect x="660" y="280" width="300" height="360" rx="6" fill="#dde3d5"></rect>
              <path d="M0 240 H1000 M0 500 H1000 M260 0 V700 M640 0 V700" stroke="#ffffff" stroke-width="14"></path>
              <path d="M150 560 L800 175" stroke="#16281f" stroke-width="9" fill="none"></path><path d="M150 560 L800 175" stroke="#a3d24a" stroke-width="5" fill="none"></path>
            </svg>
            <div style="position: absolute; left: 80%; top: 25%; transform: translate(-50%,-50%); background: #ffffff; padding: 8px 12px; border: 1px solid #4c7a2f; border-radius: 8px; font-size: 12px;">Tu dirección</div>
            <div aria-label="Posición del recolector" style="position: absolute; transition: left .5s linear, top .5s linear; transform: translate(-50%,-50%); border: 3px solid #ffffff; background: #16281f; color: #a3d24a; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;" [style.left.%]="markerLeft()" [style.top.%]="markerTop()"><span style="width: 18px; height: 18px;" [innerHTML]="store.collectorIcon | safeHtml"></span></div>
          </div>
          <div style="font-size: 11px; color: #5d6b5f;">Ubicación y tiempos simulados para la demostración.</div>
        </div>
      </div>
    }
  `,
})
export class TrackingDialogComponent implements OnInit, OnDestroy {
  readonly store = inject(ConsoleStore);
  private readonly progress = signal(0);
  private base = 0;
  private start = 0;
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly markerLeft = computed(() => 15 + 65 * (this.progress() / 100));
  readonly markerTop = computed(() => 80 - 55 * (this.progress() / 100));
  readonly eta = computed(() => Math.ceil(18 * (1 - this.progress() / 100)));
  readonly statusLabel = computed(() => (this.progress() >= 100 ? 'El recolector llegó a tu dirección' : 'En camino'));

  ngOnInit(): void {
    this.base = this.store.trackingStart();
    this.start = Date.now();
    this.progress.set(this.base);
    this.timer = setInterval(() => {
      this.progress.set(Math.min(100, this.base + (Date.now() - this.start) / 600));
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}
