import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthFormComponent } from './auth-form.component';

// Comportamiento del componente de acceso con jsdom. Datos ficticios; Router simulado.
describe('AuthFormComponent', () => {
  let fixture: ComponentFixture<AuthFormComponent>;
  let navigate: ReturnType<typeof vi.fn>;

  function setup(mode: 'login' | 'register', account: string | null = null) {
    navigate = vi.fn();
    TestBed.configureTestingModule({
      imports: [AuthFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => account } } } },
      ],
    });
    fixture = TestBed.createComponent(AuthFormComponent);
    fixture.componentRef.setInput('mode', mode);
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const q = (s: string) => el().querySelector(s) as HTMLElement | null;
  const qa = (s: string) => Array.from(el().querySelectorAll(s)) as HTMLElement[];
  const alerts = () => qa('[role="alert"], .account-error').map((n) => n.textContent?.trim());

  function type(sel: string, value: string) {
    const input = q(sel) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
  function click(e: HTMLElement | null) { e?.dispatchEvent(new MouseEvent('click')); fixture.detectChanges(); }

  it('login: encabezado, botón y sin nombre/teléfono', () => {
    setup('login');
    expect(q('.flow-heading')?.textContent?.trim()).toBe('INICIAR SESIÓN');
    expect(q('.submit-button')?.textContent?.trim()).toBe('Entrar');
    expect(q('input[type="text"]')).toBeNull();
    expect(q('input[type="tel"]')).toBeNull();
  });

  it('registro: encabezado, botón y campos de nombre y teléfono', () => {
    setup('register');
    expect(q('.flow-heading')?.textContent?.trim()).toBe('CREAR CUENTA');
    expect(q('.submit-button')?.textContent?.trim()).toBe('Crear cuenta');
    expect(q('input[type="text"]')).not.toBeNull();
    expect(q('input[type="tel"]')).not.toBeNull();
  });

  it('dos tarjetas de cuenta con su rol', () => {
    setup('login');
    const cards = qa('.account-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('ENTRA COMO RECICLADOR');
    expect(cards[1].textContent).toContain('ENTRA COMO GENERADOR');
  });

  it('seleccionar una tarjeta marca aria-checked', () => {
    setup('login');
    const cards = qa('.account-card');
    click(cards[0]);
    expect(cards[0].getAttribute('aria-checked')).toBe('true');
  });

  it('preselecciona por ?account=bodega', () => {
    setup('login', 'bodega');
    expect(qa('.account-card')[1].getAttribute('aria-checked')).toBe('true');
  });

  it('login vacío muestra errores del prototipo y no navega', () => {
    setup('login');
    click(q('.submit-button'));
    const msgs = alerts();
    expect(msgs).toContain('Ingresa un correo válido, como nombre@dominio.com.');
    expect(msgs).toContain('Elige un tipo de cuenta para continuar.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('login válido (Ciudadano) navega a /app/mapa', () => {
    setup('login');
    click(qa('.account-card')[0]);
    type('input[type="email"]', 'ficticio@demo.pe');
    type('input[type="password"]', '12345678');
    click(q('.submit-button'));
    expect(navigate).toHaveBeenCalledWith(['/app', 'mapa']);
  });

  it('registro válido (Bodega) navega a /app/publicar', () => {
    setup('register');
    click(qa('.account-card')[1]);
    type('input[type="text"]', 'Ana Torres');
    type('input[type="email"]', 'ficticio@demo.pe');
    type('input[type="tel"]', '987654321');
    type('input[type="password"]', 'clave1234');
    click(q('.submit-button'));
    expect(navigate).toHaveBeenCalledWith(['/app', 'publicar']);
  });

  it('Google sin cuenta muestra error y no navega', () => {
    setup('login');
    click(qa('.social-button')[0]);
    expect(alerts()).toContain('Elige un tipo de cuenta antes de continuar con Google o Facebook.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('el enlace alterna login → /registro', () => {
    setup('login');
    click(q('.auth-link'));
    expect(navigate).toHaveBeenCalledWith(['/registro']);
  });

  it('Enter en la tarjeta envía el formulario', () => {
    setup('login');
    click(qa('.account-card')[0]);
    type('input[type="email"]', 'ficticio@demo.pe');
    type('input[type="password"]', '12345678');
    q('.auth-card')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(navigate).toHaveBeenCalledWith(['/app', 'mapa']);
  });
});
