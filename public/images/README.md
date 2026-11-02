# Assets · QhuriNet

Todo en **SVG**: escala sin pérdida, pesa poco y toma el color del contexto.

> Los íconos que usa `index.html` están **embebidos** en ese
> archivo, no cargados desde aquí. El artboard se publica en un sandbox que
> bloquea las peticiones a archivos vecinos. El trazo es el mismo en ambos
> lados: **si cambias uno, cambia el otro**.

## Estructura

```
public/images/
├─ logo/          marca, logotipo y favicon
├─ nav/           íconos de navegación y acciones (24×24)
├─ materials/     tipos de material (24×24)
├─ avatars/       avatares de las personas de muestra (96×96)
├─ ui/            íconos de interfaz e ilustraciones
└─ social/        imagen de previsualización para enlaces
```

## logo/

| Archivo                | Uso                                              |
| ---------------------- | ------------------------------------------------ |
| `logo-mark.svg`        | Marca sola, verde sobre tinta. Barra lateral, app |
| `logo-mark-light.svg`  | Marca invertida, para fondos oscuros              |
| `logo-full.svg`        | Marca + "QhuriNet" + bajada, sobre fondo claro    |
| `logo-full-dark.svg`   | Igual, para fondos oscuros                        |
| `favicon.svg`          | Pestaña del navegador (radio menor, trazo mayor)  |

La marca es un anillo abierto que se lee a la vez como **Q** y como ciclo de
reciclaje; el punto superior es el nodo de red. Área de respeto mínima: la
altura de la letra "Q". No la estires, no la recolorees fuera de la paleta y no
le agregues sombras.

## nav/ · materials/ · ui/ (íconos)

`viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, grosor **1,7–1,8**,
extremos y uniones redondeados.

Usan `currentColor`: heredan el color del contenedor. Para recolorear uno,
cambia el `color` del padre, no el SVG.

**materials/** — `carton`, `papel`, `pet`, `vidrio`, `metal`, `electronicos`,
`organico`. Cada material tiene su color de chip asignado en los estilos de `index.html`.

**nav/** — las siete pestañas (`mapa`, `recojos`, `chats`, `publicar`,
`publicaciones`, `perfil`, `soporte`) más `buscar` y `qr`.

**ui/** — `foto`, `tarjeta`, `billetera`, `reloj`, `ubicacion`, `peso`,
`verificado`, `estrella`, `alerta`.

## avatars/

96×96, círculo de color con iniciales: `marco-quispe` (el usuario),
`juan-flores`, `camila-salazar`, `emilia-valencia` y `generico` (silueta, para
quien no tenga foto). Son marcadores de posición hasta que haya fotos reales.

## ui/ (ilustraciones)

| Archivo                  | Tamaño   | Uso                                        |
| ------------------------ | -------- | ------------------------------------------ |
| `placeholder-foto.svg`   | 160×160  | Hueco de foto del material en Publicar     |
| `estado-vacio.svg`       | 240×160  | Listas sin resultados                      |
| `mapa-placeholder.svg`   | 400×260  | Mapa mientras carga o si falla             |

## social/

`og-image.svg` — 1200×630, la proporción que piden Open Graph y Twitter Cards.

Para usarla en `<meta property="og:image">` hay que **exportarla a PNG o JPG**:
casi ningún lector de enlaces acepta SVG.

```bash
# con rsvg-convert
rsvg-convert -w 1200 -h 630 social/og-image.svg -o social/og-image.png

# o con Inkscape
inkscape social/og-image.svg -w 1200 -h 630 -o social/og-image.png
```

## Agregar un ícono nuevo

1. Copia la cabecera de cualquier archivo de `nav/` y respeta el grosor de trazo.
2. Dibuja dentro de la caja de 24×24 dejando ~2 px de aire a cada lado.
3. Nada de `fill` de color ni de `stroke` fijo: usa `currentColor`.
4. Nombre en minúsculas, sin tildes ni espacios (`plastico-pet.svg`).
5. Si el prototipo lo va a usar, **agrégalo también** al mapa correspondiente
   dentro del `.dc.html` (`MATERIALS` o `ICONS`).
