import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal «Documentos de verificación»: lista y subida (aprobación automática). */
@Component({
  selector: 'app-documents-dialog',
  imports: [FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flow-overlay">
      <div class="flow-dialog" appFocusTrap role="dialog" aria-modal="true" aria-label="Documentos de verificación" (keydown.escape)="store.closeDocs()" style="width: 560px;">
        <div style="display: flex; justify-content: space-between; align-items: center;"><div><div class="flow-heading">VERIFICACIÓN</div><div style="font-size: 17px; font-weight: 600; margin-top: 6px;">Mis documentos</div></div><button type="button" class="flow-button" aria-label="Cerrar diálogo" (click)="store.closeDocs()">×</button></div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: grid; grid-template-columns: 70px 1fr 110px 90px; gap: 10px; font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.06em; color: #6c7a6e; padding-bottom: 6px; border-bottom: 1px solid #eceee7;"><div>TIPO</div><div>DOCUMENTO</div><div>ESTADO</div><div>FECHA</div></div>
          @for (d of store.documentsView(); track d.id) {
            <div style="display: grid; grid-template-columns: 70px 1fr 110px 90px; gap: 10px; align-items: center; font-size: 12.5px; padding: 8px 0; border-bottom: 1px solid #eceee7;">
              <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px;">{{ d.type }}</div>
              <div style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ d.name }}@if (d.fresh) {<span class="material-tag" style="margin-left: 8px;">Nuevo</span>}</div>
              <div style="display: flex; align-items: center; gap: 7px;"><div style="width: 8px; height: 8px; border-radius: 50%;" [style.background]="d.dot"></div><div style="font-family: 'IBM Plex Mono', monospace; font-size: 10px;" [style.color]="d.stateFg">{{ d.stateLabel }}</div></div>
              <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #5d6b5f;">{{ d.date }}</div>
            </div>
          }
        </div>
        <div style="background: #f4f5f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 13px; font-weight: 600;">Subir un documento</div>
          <div>
            <div class="flow-heading">TIPO</div>
            <div role="radiogroup" aria-label="Tipo de documento" style="display: flex; gap: 7px; margin-top: 8px;">
              @for (t of store.docTypeChips(); track t.label) {
                <button type="button" role="radio" (click)="store.selectDocType(t.label)" style="font: inherit; font-size: 12px; padding: 6px 13px; border-radius: 20px; cursor: pointer;" [style.background]="t.bg" [style.color]="t.fg" [style.border]="'1px solid ' + t.border">{{ t.label }}</button>
              }
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <label class="flow-button" style="display: inline-block;">Seleccionar archivo<input type="file" accept="image/*,.pdf" aria-label="Seleccionar archivo" (change)="store.onDocFile($any($event.target))" style="display: none;" /></label>
            @if (store.docFile()) { <div style="font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #3d4a3f;">{{ store.docFile() }}</div> } @else { <div style="font-size: 12px; color: #8b9186;">PDF o imagen · se valida automáticamente</div> }
          </div>
          @if (store.docError()) { <div role="alert" style="font-size: 12px; color: #b1573f;">{{ store.docError() }}</div> }
          <div><button type="button" class="flow-button flow-primary" (click)="store.uploadDoc()">Subir documento</button></div>
        </div>
      </div>
    </div>
  `,
})
export class DocumentsDialogComponent {
  readonly store = inject(ConsoleStore);
}
