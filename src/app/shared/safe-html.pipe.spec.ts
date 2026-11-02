import { TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';
import { ICONS } from '../model/icons';

// El pipe solo debe confiar en SVG estático y conocido; nunca en HTML arbitrario.
describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    pipe = TestBed.runInInjectionContext(() => new SafeHtmlPipe());
  });

  it('marca como confiable un ícono conocido de la app', () => {
    const result = pipe.transform(ICONS['mapa']);
    // bypassSecurityTrustHtml devuelve un objeto SafeValue, no una cadena.
    expect(typeof result).toBe('object');
  });

  it('NO confía en HTML arbitrario: lo sanea (sin ejecutar scripts)', () => {
    const malicious = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
    const result = pipe.transform(malicious);
    expect(typeof result).toBe('string');
    expect(String(result)).not.toContain('onerror');
    expect(String(result)).not.toContain('<script');
  });

  it('una cadena vacía o no reconocida no produce markup confiable', () => {
    expect(typeof pipe.transform('<svg onload="x()"></svg>')).toBe('string');
  });
});
