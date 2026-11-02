import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConsoleStore } from '../../../services/console-store';
import { FocusTrapDirective } from '../../../shared/focus-trap.directive';

/** Modal «Editar perfil»: nombre, teléfono, descripción, materiales y foto. */
@Component({
  selector: 'app-edit-profile-dialog',
  imports: [FocusTrapDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.profileForm(); as pf) {
      <div class="flow-overlay">
        <div class="flow-dialog" appFocusTrap role="dialog" aria-modal="true" aria-label="Editar perfil" (keydown.escape)="store.closeEdit()" style="width: 520px;">
          <div style="display: flex; justify-content: space-between; align-items: center;"><span style="font-size: 17px; font-weight: 600;">Editar perfil</span><button type="button" class="flow-button" aria-label="Cerrar diálogo" (click)="store.closeEdit()">×</button></div>
          <div style="display: flex; align-items: center; gap: 16px;">
            @if (pf.photo) {
              <img [src]="pf.photo" alt="Vista previa de la foto" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; flex: none;" />
            } @else {
              <div style="width: 64px; height: 64px; border-radius: 50%; background: #16281f; color: #a3d24a; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; flex: none;">{{ pf.name.trim()[0] || 'M' }}</div>
            }
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <label class="flow-button" style="display: inline-block;">Cambiar foto<input type="file" accept="image/*" aria-label="Cambiar foto" (change)="store.onPfPhoto($any($event.target))" style="display: none;" /></label>
              @if (pf.photo) { <button type="button" class="flow-button flow-danger" (click)="store.removePfPhoto()">Quitar foto</button> }
            </div>
          </div>
          <div><label style="display: block; font-size: 12px; font-weight: 600;">Nombre<input class="flow-field" aria-label="Nombre" [value]="pf.name" (input)="store.onPfField('name', $any($event.target).value)" maxlength="60" /></label>@if (store.pfErrName()) { <div role="alert" style="font-size: 12px; color: #b1573f; margin-top: 6px;">{{ store.pfErrName() }}</div> }</div>
          <div><label style="display: block; font-size: 12px; font-weight: 600;">Teléfono<input class="flow-field" type="tel" aria-label="Teléfono" [value]="pf.phone" (input)="store.onPfField('phone', $any($event.target).value)" maxlength="20" /></label>@if (store.pfErrPhone()) { <div role="alert" style="font-size: 12px; color: #b1573f; margin-top: 6px;">{{ store.pfErrPhone() }}</div> }</div>
          <label style="display: block; font-size: 12px; font-weight: 600;">Descripción<textarea class="flow-field" aria-label="Descripción" [value]="pf.bio" (input)="store.onPfField('bio', $any($event.target).value)" maxlength="240" rows="3" placeholder="Cuenta qué recoges, en qué zona y en qué horarios."></textarea></label>
          <div>
            <div style="font-size: 12px; font-weight: 600;">Materiales que manejas</div>
            <div style="display: flex; flex-wrap: wrap; gap: 7px; margin-top: 8px;">
              @for (m of store.pfMatChips(); track m.key) {
                <button type="button" (click)="store.togglePfMat(m.key)" style="font: inherit; font-size: 12px; padding: 7px 13px; border-radius: 8px; cursor: pointer;" [style.background]="m.bg" [style.color]="m.fg" [style.border]="'1px solid ' + m.border">{{ m.label }}</button>
              }
            </div>@if (store.pfErrMats()) { <div role="alert" style="font-size: 12px; color: #b1573f; margin-top: 6px;">{{ store.pfErrMats() }}</div> }
          </div>
          <div style="display: flex; gap: 8px;"><button type="button" class="flow-button flow-primary" (click)="store.saveProfile()">Guardar cambios</button><button type="button" class="flow-button" (click)="store.closeEdit()">Cancelar</button></div>
        </div>
      </div>
    }
  `,
})
export class EditProfileDialogComponent {
  readonly store = inject(ConsoleStore);
}
