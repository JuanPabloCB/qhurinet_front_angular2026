import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Tab } from '../../../model/account.model';
import { ConsoleStore } from '../../../services/console-store';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { EditProfileDialogComponent } from '../../modals/edit-profile-dialog/edit-profile-dialog.component';
import { DocumentsDialogComponent } from '../../modals/documents-dialog/documents-dialog.component';
import { PaymentDialogComponent } from '../../modals/payment-dialog/payment-dialog.component';
import { SaveRouteDialogComponent } from '../../modals/save-route-dialog/save-route-dialog.component';
import { ActionDialogComponent } from '../../modals/action-dialog/action-dialog.component';
import { TrackingDialogComponent } from '../../modals/tracking-dialog/tracking-dialog.component';
import { ScannerDialogComponent } from '../../modals/scanner-dialog/scanner-dialog.component';
import { RateDialogComponent } from '../../modals/rate-dialog/rate-dialog.component';

/**
 * Armazón de la consola: barra lateral + cabecera + pantalla activa (router) y
 * los modales/paneles globales. Sincroniza la pestaña activa del store con la
 * ruta, y el rol con la sesión del acceso.
 */
@Component({
  selector: 'app-console-shell',
  imports: [
    RouterOutlet, SidebarComponent, TopbarComponent,
    EditProfileDialogComponent, DocumentsDialogComponent, PaymentDialogComponent,
    SaveRouteDialogComponent, ActionDialogComponent, TrackingDialogComponent,
    ScannerDialogComponent, RateDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './console-shell.component.html',
  styleUrl: './console-shell.component.css',
})
export class ConsoleShellComponent implements OnInit {
  readonly store = inject(ConsoleStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.store.syncRoleFromSession();
    this.applyTab();
    // Deep links documentados: siembra el estado desde los query params al abrir.
    this.store.seedFromQuery(this.route.snapshot.queryParamMap);
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyTab());
  }

  private applyTab(): void {
    const tab = this.route.firstChild?.snapshot.data['tab'] as Tab | undefined;
    if (tab) this.store.setActiveTab(tab);
  }
}
