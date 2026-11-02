import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

// El guard protege /app: con sesión simulada deja pasar; sin ella, redirige a /login.
describe('authGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([])] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  const run = () => TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  it('sin sesión redirige a /login', () => {
    const result = run();
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });

  it('con sesión simulada permite el acceso', () => {
    auth.selectAccount('ciudadano');
    auth.updateField('email', 'ficticio@demo.pe');
    auth.updateField('password', '12345678');
    auth.submit('login');
    expect(run()).toBe(true);
  });
});
