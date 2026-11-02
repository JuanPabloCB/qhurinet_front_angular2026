import { AuthService, validEmail, validPhone } from './auth.service';

// Lógica de acceso SIMULADA (sin backend). Datos ficticios.

describe('validadores de formato', () => {
  it('validEmail acepta correos válidos y rechaza mal formados', () => {
    expect(validEmail('marco.q@gmail.com')).toBe(true);
    expect(validEmail('  espacios@dominio.pe  ')).toBe(true);
    expect(validEmail('sinarroba')).toBe(false);
    expect(validEmail('a@b.c')).toBe(false);
  });

  it('validPhone acepta 9 dígitos (con o sin +51) y rechaza el resto', () => {
    expect(validPhone('987654321')).toBe(true);
    expect(validPhone('+51 987 654 321')).toBe(true);
    expect(validPhone('12345')).toBe(false);
    expect(validPhone('9876543210')).toBe(false);
  });
});

describe('AuthService', () => {
  let auth: AuthService;
  beforeEach(() => { auth = new AuthService(); });

  it('arranca sin sesión y con el formulario vacío', () => {
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.selectedAccount()).toBe('');
    expect(auth.form()).toEqual({ name: '', email: '', phone: '', password: '' });
  });

  it('selectAccount fija la cuenta y limpia su error', () => {
    auth.errors.set({ account: 'x' });
    auth.selectAccount('bodega');
    expect(auth.selectedAccount()).toBe('bodega');
    expect(auth.errors().account).toBe('');
  });

  it('preselectAccount solo aplica valores válidos y no pisa una elección previa', () => {
    auth.preselectAccount('desconocido');
    expect(auth.selectedAccount()).toBe('');
    auth.preselectAccount('ciudadano');
    auth.preselectAccount('bodega');
    expect(auth.selectedAccount()).toBe('ciudadano');
  });

  it('updateField recorta a 80 y limpia el error del campo', () => {
    auth.errors.set({ email: 'x' });
    auth.updateField('email', 'a'.repeat(100));
    expect(auth.form().email.length).toBe(80);
    expect(auth.errors().email).toBe('');
  });

  it('login inválido devuelve null y los mensajes del prototipo', () => {
    auth.updateField('email', 'malcorreo');
    auth.updateField('password', '123');
    expect(auth.submit('login')).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.errors()).toMatchObject({
      email: 'Ingresa un correo válido, como nombre@dominio.com.',
      password: 'Ingresa tu contraseña (mínimo 8 caracteres).',
      account: 'Elige un tipo de cuenta para continuar.',
    });
  });

  it('login válido con Ciudadano entra como reciclador', () => {
    auth.selectAccount('ciudadano');
    auth.updateField('email', 'ficticio@demo.pe');
    auth.updateField('password', '12345678');
    expect(auth.submit('login')).toBe('reciclador');
    expect(auth.session()).toEqual({ account: 'ciudadano', role: 'reciclador' });
    expect(auth.form()).toEqual({ name: '', email: '', phone: '', password: '' });
  });

  it('registro inválido: nombre corto, teléfono y contraseña inválidos', () => {
    auth.selectAccount('bodega');
    auth.updateField('name', 'Marco');
    auth.updateField('email', 'ficticio@demo.pe');
    auth.updateField('phone', '12345');
    auth.updateField('password', '1234567');
    expect(auth.submit('register')).toBeNull();
    expect(auth.errors()).toMatchObject({
      name: 'Escribe tu nombre y apellidos.',
      phone: 'El teléfono debe tener 9 dígitos (formato peruano).',
      password: 'La contraseña debe tener al menos 8 caracteres.',
    });
  });

  it('registro válido con Bodega entra como generador', () => {
    auth.selectAccount('bodega');
    auth.updateField('name', 'Ana Torres');
    auth.updateField('email', 'ficticio@demo.pe');
    auth.updateField('phone', '+51 987 654 321');
    auth.updateField('password', 'clave1234');
    expect(auth.submit('register')).toBe('generador');
  });

  it('socialAuth exige elegir cuenta primero; con cuenta, entra', () => {
    expect(auth.socialAuth()).toBeNull();
    expect(auth.errors().account).toBe('Elige un tipo de cuenta antes de continuar con Google o Facebook.');
    auth.selectAccount('ciudadano');
    expect(auth.socialAuth()).toBe('reciclador');
  });

  it('logout vuelve al estado inicial', () => {
    auth.selectAccount('bodega');
    auth.updateField('email', 'ficticio@demo.pe');
    auth.updateField('password', '12345678');
    auth.submit('login');
    auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.selectedAccount()).toBe('');
  });
});
