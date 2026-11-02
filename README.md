# QhuriNet · Consola de reciclaje urbano (frontend Angular 22)

Frontend del prototipo **QhuriNet**, una consola web que conecta a **recicladores**
(ciudadanos que recogen material) con **generadores** (bodegas y comercios que
publican residuos aprovechables) en Lima. Es una migración fiel del prototipo
estático de `referencia-html/` a una aplicación **Angular 22** nativa.

> **Alcance:** prototipo visual **sin backend**. No hay API REST, base de datos,
> Firebase/Supabase ni autenticación real: todos los datos son ficticios y la
> lógica (acceso, rutas, QR, seguimiento, clasificación de material…) está
> **simulada en memoria** y se reinicia al recargar. La conexión al backend se
> planifica para el Sprint 2.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Cómo ejecutarlo

```bash
npm ci            # instala las dependencias exactas del package-lock
npm start         # o: ng serve
```

Luego abre `http://localhost:4200/`. Entra con cualquier correo y contraseña
ficticios y elige el tipo de cuenta:

- **Ciudadano** → rol **reciclador** (Mapa, Recojos).
- **Bodega o comercio** → rol **generador** (Publicar, Anuncios).

Las pestañas Chats, Perfil y Soporte son comunes a ambos roles.

## Scripts

```bash
npm start              # servidor de desarrollo (ng serve)
npm run build          # build de producción en dist/
npx ng test --no-watch # pruebas unitarias (Vitest + jsdom)
```

## Estructura del proyecto

```
src/app/
  model/        Interfaces y datos de muestra (cuentas, materiales, puntos,
                anuncios, entregas, chat, perfil, soporte, notificaciones) e íconos.
  services/     auth.service (acceso simulado), auth.guard (protege /app) y
                console-store (todo el estado simulado de la consola: signals,
                computed y acciones; equivale a la clase del prototipo).
  shared/       safe-html.pipe (inyecta sólo SVG propio de confianza) y
                focus-trap.directive (control de foco accesible en los modales).
  components/
    auth/       auth-layout, auth-form (login y registro).
    console/    console-shell (armazón), sidebar, topbar.
    map/ pickups/ publish/ publications/ chats/ profile/ support/
                una pantalla por página (un componente por ruta).
    delivery-table/   tabla compartida por Recojos y Anuncios.
    modals/     editar perfil, documentos, pagos, guardar ruta, acción
                (reprogramar/coordinar/cancelar), seguimiento, escáner QR, valoración.
  app.routes.ts  Rutas: /login y /registro; /app/* protegido por el guard y con
                 las pantallas cargadas de forma diferida (loadComponent).
```

## Decisiones técnicas

- **Standalone components**, **signals** y `ChangeDetectionStrategy.OnPush`.
- Aplicación **zoneless** (sin `zone.js`).
- Router con `withComponentInputBinding()`; la pestaña y el modo se pasan por
  `data` de la ruta.
- Estilos fieles al prototipo (en línea en las plantillas) más clases globales
  `.flow-*`, `.map-*`, `.point-*` en `src/styles.css`. Fuentes IBM Plex por `<link>`.
- Layout de **escritorio** (igual que el prototipo original).

## Qué es real, simulado o decorativo

El archivo `TRAZABILIDAD.md` detalla, pantalla por pantalla, qué funcionalidades
están implementadas de verdad, cuáles son una simulación (comportamiento
fabricado sin backend) y cuáles son decorativas (sin acción, a propósito).

No se modifica nada dentro de `referencia-html/`: es la fuente de verdad visual.
