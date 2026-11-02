import { Injectable, computed, signal } from '@angular/core';
import {
  ACCOUNT_TYPES,
  AccountType,
  AuthErrors,
  AuthForm,
  AuthMode,
  Role,
  Session,
} from '../model/account.model';

const EMPTY_FORM: AuthForm = { name: '', email: '', phone: '', password: '' };

// Validadores idénticos a validEmail / validPhone de referencia-html/index.html.
export const validEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v ?? '').trim());

export const validPhone = (v: string): boolean =>
  /^\d{9}$/.test((v ?? '').replace(/^\+?51/, '').replace(/\D/g, ''));

/**
 * Estado del acceso SIMULADO. Reproduce submitAuth/socialAuth/enterApp/logout
 * del prototipo con signals. No hay backend: cualquier correo con formato
 * válido y contraseña de 8 caracteres entra, por eso se exige el tipo de cuenta.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly selectedAccount = signal<AccountType | ''>('');
  readonly form = signal<AuthForm>({ ...EMPTY_FORM });
  readonly errors = signal<AuthErrors>({});

  private readonly _session = signal<Session | null>(null);
  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => this._session() !== null);

  selectAccount(type: AccountType): void {
    this.selectedAccount.set(type);
    this.clearError('account');
  }

  preselectAccount(type: string | null | undefined): void {
    if (type && type in ACCOUNT_TYPES && !this.selectedAccount()) {
      this.selectedAccount.set(type as AccountType);
    }
  }

  updateField<K extends keyof AuthForm>(key: K, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value.slice(0, 80) }));
    this.clearError(key);
  }

  clearErrors(): void {
    this.errors.set({});
  }

  /** Valida y, si procede, crea la sesión. Devuelve el rol de entrada o null. */
  submit(mode: AuthMode): Role | null {
    const f = this.form();
    const register = mode === 'register';
    const errors: AuthErrors = {};

    if (register && f.name.trim().split(/\s+/).length < 2) {
      errors.name = 'Escribe tu nombre y apellidos.';
    }
    if (!validEmail(f.email)) {
      errors.email = 'Ingresa un correo válido, como nombre@dominio.com.';
    }
    if (register && !validPhone(f.phone)) {
      errors.phone = 'El teléfono debe tener 9 dígitos (formato peruano).';
    }
    if (f.password.length < 8) {
      errors.password = register
        ? 'La contraseña debe tener al menos 8 caracteres.'
        : 'Ingresa tu contraseña (mínimo 8 caracteres).';
    }
    if (!this.selectedAccount()) {
      errors.account = 'Elige un tipo de cuenta para continuar.';
    }

    if (Object.keys(errors).length) {
      this.errors.set(errors);
      return null;
    }
    return this.enter(this.selectedAccount() as AccountType);
  }

  /** Google / Facebook: sin OAuth, entran con el tipo de cuenta elegido. */
  socialAuth(): Role | null {
    if (!this.selectedAccount()) {
      this.errors.set({
        account: 'Elige un tipo de cuenta antes de continuar con Google o Facebook.',
      });
      return null;
    }
    return this.enter(this.selectedAccount() as AccountType);
  }

  logout(): void {
    this._session.set(null);
    this.selectedAccount.set('');
    this.form.set({ ...EMPTY_FORM });
    this.errors.set({});
  }

  private enter(type: AccountType): Role {
    const role = ACCOUNT_TYPES[type].role;
    this._session.set({ account: type, role });
    this.form.set({ ...EMPTY_FORM });
    this.errors.set({});
    return role;
  }

  private clearError(key: keyof AuthErrors): void {
    this.errors.update((e) => ({ ...e, [key]: '' }));
  }
}
