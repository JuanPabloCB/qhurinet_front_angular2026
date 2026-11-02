import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ACCOUNT_TYPE_LIST, AccountType, AuthForm, AuthMode, Role } from '../../../model/account.model';
import { AuthService } from '../../../services/auth.service';

/**
 * Tarjeta de acceso. Un solo componente para login y registro (como la pantalla
 * única con `sc-if` del prototipo): el modo llega por los datos de la ruta.
 */
@Component({
  selector: 'app-auth-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-form.component.html',
  styleUrl: './auth-form.component.css',
})
export class AuthFormComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mode = input<AuthMode>('login');

  readonly form = this.auth.form;
  readonly errors = this.auth.errors;

  readonly heading = computed(() => (this.mode() === 'register' ? 'CREAR CUENTA' : 'INICIAR SESIÓN'));
  readonly title = computed(() => (this.mode() === 'register' ? 'Crea tu cuenta' : 'Bienvenido de vuelta'));
  readonly subtitle = computed(() =>
    this.mode() === 'register'
      ? 'Conecta con recicladores y generadores de tu zona en menos de un minuto.'
      : 'Ingresa para ver tus recojos, anuncios y mensajes.',
  );
  readonly buttonLabel = computed(() => (this.mode() === 'register' ? 'Crear cuenta' : 'Entrar'));

  readonly accountCards = computed(() =>
    ACCOUNT_TYPE_LIST.map((a) => ({
      key: a.key,
      label: a.label,
      hint: a.hint,
      roleLabel: a.role === 'generador' ? 'GENERADOR' : 'RECICLADOR',
      selected: this.auth.selectedAccount() === a.key,
    })),
  );

  constructor() {
    this.auth.preselectAccount(this.route.snapshot.queryParamMap.get('account'));
  }

  selectAccount(type: AccountType): void {
    this.auth.selectAccount(type);
  }

  update(key: keyof AuthForm, event: Event): void {
    this.auth.updateField(key, (event.target as HTMLInputElement).value);
  }

  submit(): void {
    this.enter(this.auth.submit(this.mode()));
  }

  socialAuth(): void {
    this.enter(this.auth.socialAuth());
  }

  private enter(role: Role | null): void {
    if (!role) return;
    this.router.navigate(['/app', role === 'generador' ? 'publicar' : 'mapa']);
  }

  switchTo(path: 'login' | 'registro'): void {
    this.auth.clearErrors();
    this.router.navigate(['/' + path]);
  }
}
