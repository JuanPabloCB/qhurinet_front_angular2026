import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

// Navegación real (no solo HTTP 200): monta el Router con las rutas de la app y
// comprueba qué pantalla se activa y cómo protege el guard a /app.
describe('rutas de la app', () => {
  let harness: RouterTestingHarness;
  let auth: AuthService;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter(routes, withComponentInputBinding())],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    harness = await RouterTestingHarness.create();
  });

  const text = () => harness.routeNativeElement?.textContent ?? '';

  function login(account: 'ciudadano' | 'bodega') {
    auth.selectAccount(account);
    auth.updateField('email', 'ficticio@demo.pe');
    auth.updateField('password', '12345678');
    auth.submit('login');
  }

  it('/login activa la tarjeta de inicio de sesión', async () => {
    await harness.navigateByUrl('/login');
    expect(text()).toContain('INICIAR SESIÓN');
  });

  it('/registro activa la tarjeta de registro', async () => {
    await harness.navigateByUrl('/registro');
    expect(text()).toContain('CREAR CUENTA');
  });

  it('la raíz redirige a /login', async () => {
    await harness.navigateByUrl('/');
    expect(router.url).toBe('/login');
  });

  it('/app sin sesión redirige a /login (guard)', async () => {
    await harness.navigateByUrl('/app');
    expect(router.url).toBe('/login');
  });

  it('/app con sesión de reciclador abre el Mapa', async () => {
    login('ciudadano');
    await harness.navigateByUrl('/app');
    expect(router.url).toBe('/app/mapa');
    expect(text()).toContain('Materiales disponibles');
  });

  it('/app/publicar con sesión de generador abre Publicar', async () => {
    login('bodega');
    await harness.navigateByUrl('/app/publicar');
    expect(router.url).toBe('/app/publicar');
    expect(text()).toContain('Anunciar material');
  });

  it('/app/recojos abre la tabla de recojos', async () => {
    login('ciudadano');
    await harness.navigateByUrl('/app/recojos');
    expect(text()).toContain('MATERIAL / LUGAR');
  });
});
