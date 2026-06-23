# Convenciones de código — Scripts InDesign (ExtendScript)

## Entorno

- El motor es **ExtendScript (ES3)** — sin `let`, `const`, arrow functions, template strings, clases, módulos ES.
- Los scripts se ejecutan desde el panel **Scripts** de InDesign (no desde ExtendScript Toolkit).
- Versión blanco: InDesign 20.0 (2026).

## Estructura del proyecto

El entry point `maquetar.jsx` vive en la raíz (es lo que aparece en el panel Scripts). Todo lo demás se organiza **por dominio de conocimiento** dentro de `maquetar/`. Cada dominio agrupa su **núcleo puro** (`.js`, sin API de InDesign, testeable en Node) junto a su **adaptador InDesign** (`.jsx`).

```
JavaScript/
  maquetar.jsx                    ← entry point (panel Scripts): CONFIG + #include + Aplicacion.ejecutar
  maquetar/
    unidades/
      unidades.js                 puro: conversión de unidades a mm
      Unidades.jsx                adaptador: viewPreferences + ejecutarConUnidadesEnPuntos
    formatos/
      catalogoDeFormatos.js       puro: catálogo legacy (default del clasificador)
      clasificacionDeFormato.js   puro: clasifica dimensiones → variante (completo/media/cuarto)
      papeles.js                  puro: papeles (Carta / 14 / Oficio) + ejes + verificación + catálogo
      CatalogoDeFormatos.jsx      wrapper
      ClasificacionDeFormato.jsx  wrapper
    geometria/
      bounds.js                   puro: primitivas de bounds (centros, zonas, ejes de plegado)
      validarSuperposicion.js     puro: ¿el elemento cruza el eje de plegado?
      trazadoDeGuias.js           puro: cálculo de centros de página
      TrazadoDeGuias.jsx          adaptador: crea guías (centro o en mm absolutos)
    indesign/
      adaptadorInDesign.js        puro: resolución de FourCharCodes de orientación
      AdaptadorInDesign.jsx       adaptador: toda la API de InDesign (selección, bounds, guías, grupos…)
    maquetacion/
      RepeticionDeCuadrantes.jsx  duplicación/rotación geométrica (eje de plegado parametrizable)
      MaquetarCompleto.jsx        variante 1-up: solo guías de verificación (sin duplicar)
      MaquetarMedia.jsx           variante 2-up: duplica a la mitad inferior
      MaquetarCuarto.jsx          variante 4-up: 4 cuadrantes con rotación 180°
      MaquetacionPorCategoria.jsx despacha la selección a la variante según su tamaño
    ui/
      SelectorDePapel.jsx         modal ScriptUI (data-driven): elige el papel
    depuracion/
      Depuracion.jsx              log a un text frame (sin alert para flujo normal)
      DepuracionGeometrica.jsx    log detallado de bounds/rotaciones (modo detallado)
    aplicacion/
      ValidacionDeEjecucion.jsx   precondiciones: documento abierto + selección
      PresentacionDeResultados.jsx volcado final de resultados
      Aplicacion.jsx              orquestador principal
  tests/
    *.test.js                     Jest (Node) — solo cubre el núcleo puro
```

### Módulos como IIFE

Cuando un módulo excede ~50 líneas o tiene varias responsabilidades, se organiza como una **IIFE** (Immediately Invoked Function Expression) que expone solo su superficie pública:

```javascript
var Contexto = (function() {
    // estado privado
    // funciones internas
    return { funcionPublica: funcionPublica };
})();
```

### Convención `.js` puro + `.jsx` adaptador (co-localizados)

Cada dominio separa la lógica pura de la dependiente de InDesign, en la **misma carpeta**:

- **`<modulo>.js`** (camelCase): núcleo puro, sin tocar `app`/enums globales. Doble export para poder cargarse en ambos mundos:

  ```javascript
  var MiModulo = (function() { /* ... */ })();
  if (typeof module !== "undefined" && module.exports) {
      module.exports = MiModulo;   // require() desde Jest
  }
  ```

- **`<Modulo>.jsx`** (PascalCase): wrapper que hace `#include` del `.js` de su misma carpeta y, si aplica, agrega las funciones que dependen de la API de InDesign:

  ```javascript
  // maquetar/formatos/CatalogoDeFormatos.jsx
  #include "catalogoDeFormatos.js"
  ```

  ExtendScript interpreta el `#include` como texto plano: define la variable global del módulo. Node nunca ve los `.jsx`; los tests hacen `require()` directo del `.js`.

> Regla práctica: si un nombre es `.js` lowercase, es **puro y testeable**; si es `.jsx` PascalCase, es **capa InDesign**. No metas `app.*` ni enums nativos en un `.js`.

### Orden de inclusión

Los módulos son variables globales sin declaración de dependencias, así que el **orden de `#include` en `maquetar.jsx` debe respetar el grafo de dependencias** (un módulo debe incluirse después de todo lo que use en tiempo de carga). Orden actual:

1. `unidades/Unidades.jsx` — sin dependencias
2. `formatos/CatalogoDeFormatos.jsx` — sin dependencias
3. `formatos/ClasificacionDeFormato.jsx` → CatalogoDeFormatos
4. `formatos/papeles.js` — sin dependencias
5. `geometria/bounds.js` — sin dependencias
6. `geometria/validarSuperposicion.js` → Bounds
7. `indesign/AdaptadorInDesign.jsx` → Unidades
8. `depuracion/Depuracion.jsx` → AdaptadorInDesign
9. `depuracion/DepuracionGeometrica.jsx` → Depuracion, Bounds
10. `geometria/TrazadoDeGuias.jsx` → AdaptadorInDesign, Depuracion, Bounds, Unidades
11. `aplicacion/ValidacionDeEjecucion.jsx` → AdaptadorInDesign, Depuracion
12. `maquetacion/RepeticionDeCuadrantes.jsx` → Bounds, Depuracion, DepuracionGeometrica
13. `maquetacion/MaquetarCompleto.jsx` → TrazadoDeGuias, Depuracion
14. `maquetacion/MaquetarMedia.jsx` → Bounds, ValidarSuperposicion, TrazadoDeGuias, RepeticionDeCuadrantes, Depuracion
15. `maquetacion/MaquetarCuarto.jsx` → Bounds, ValidarSuperposicion, TrazadoDeGuias, RepeticionDeCuadrantes, Depuracion
16. `maquetacion/MaquetacionPorCategoria.jsx` → Papeles, ClasificacionDeFormato, MaquetarCompleto/Media/Cuarto, AdaptadorInDesign, Bounds, Depuracion
17. `ui/SelectorDePapel.jsx` → Papeles
18. `aplicacion/PresentacionDeResultados.jsx` → Depuracion
19. `aplicacion/Aplicacion.jsx` → todos los anteriores (incl. SelectorDePapel)

Si un `#include` falla (p. ej. en InDesign 2025 o anterior que no lo soporte desde el panel Scripts), concatenar manualmente el contenido de los módulos directamente en el entry point.

## Módulos por dominio

### unidades/
- **`unidades.js`** — núcleo puro de conversión a mm. Define `FACTOR_A_MM` y expone `convertirAMilimetros()`, `convertirPuntosAMilimetros()`.
- **`Unidades.jsx`** — agrega la capa InDesign: lectura de `viewPreferences` y forzado temporal de reglas a puntos con `ejecutarConUnidadesEnPuntos()` (guarda/restaura en `finally`).

### formatos/
- **`papeles.js`** — define los **papeles de impresión** (mismo ancho 215.9, distinto alto): **Tamaño Carta** (279.4), **Tamaño 14** (274) y **Tamaño Oficio** (330). Cada papel deriva de su `alto`: ejes de plegado (`ejeHorizontalMm` = alto/2, `ejeVerticalMm` = ancho/2) y `obtenerCatalogo()` con las variantes completo/media/cuarto. La `verificacionMm` es **explícita** (solo el Tamaño 14 la usa: `[274]`) — marca el corte cuando el formato real difiere de la hoja de diseño de InDesign. El **Tamaño 14 se diseña sobre hoja Carta** y se corta en 274; Carta y Oficio se diseñan sobre su propia hoja (sin guía de corte). Expone `VARIANTE`, `TAMANO_CARTA`, `TAMANO_14`, `TAMANO_OFICIO`, `todos()`, `porNombre()`.
- **`catalogoDeFormatos.js`** — catálogo legacy (Carta/Media/Cuarto Carta); sigue siendo el **default** del clasificador cuando no se le pasa un catálogo. Expone `obtenerCatalogo()`.
- **`clasificacionDeFormato.js`** — `clasificar(dimensiones, tolerancias, catalogo?)`: compara (directo y rotado) y retorna el nombre de menor área que cabe, o `null`. Con el catálogo de un papel devuelve la **variante** (`completo`/`media`/`cuarto`); sin catálogo usa el global `CatalogoDeFormatos`.
- **`CatalogoDeFormatos.jsx` / `ClasificacionDeFormato.jsx`** — wrappers delgados (`#include` del `.js`). `papeles.js` se incluye directo (puro, sin capa InDesign).

### geometria/
- **`bounds.js`** — primitivas de geometría puras. `deObjeto(obj)` y `dePagina(pagina)` convierten arrays de bounds a `{top, left, bottom, right}`. Helpers: `centroX`, `centroY`, `ancho`, `alto`, `estaFueraDePagina`, y los que aceptan **eje de plegado opcional** (en puntos, default = centro): `estaEnMitadSuperior(obj, pag, ejeY?)`, `estaEnCuadranteSuperiorIzquierdo(obj, pag, ejeX?, ejeY?)`. Nunca índices mágicos `[0]`/`[1]`/`[2]`/`[3]` directamente.
- **`validarSuperposicion.js`** — `validarSuperposicionObjetoConLineaGuia(obj, pagina, ejeX?, ejeY?)`: ¿el elemento cruza la línea de plegado? Ejes opcionales (default = centro). Retorna `"horizontal"`, `"vertical"`, `"ambas"` o `null`. Usa `Bounds`.
- **`trazadoDeGuias.js`** — cálculo puro de centros via `Bounds`: `calcularCentroHorizontal(pagina)`, `calcularCentroVertical(pagina)`.
- **`TrazadoDeGuias.jsx`** — capa InDesign. Eje vertical al centro: `trazarVertical()`. Eje horizontal por medida absoluta en mm desde el borde superior: `posicionHorizontalEnPuntos(pagina, mm)`, `trazarGuiaHorizontalEnMm(pagina, mm)` y `trazarGuiasDeVerificacion(pagina, papel)`. Usa `Unidades.convertirMilimetrosAPuntos`.

### indesign/
- **`adaptadorInDesign.js`** — resolución de FourCharCodes de orientación con fallback progresivo: `obtenerOrientacionHorizontal()`, `obtenerOrientacionVertical()`.
- **`AdaptadorInDesign.jsx`** — capa de infraestructura: toda la interacción con `app` (documento/selección, `geometricBounds`, agrupar/desagrupar, crear guías y marcos de texto, medir en mm).

### maquetacion/
- **`RepeticionDeCuadrantes.jsx`** — duplicación geométrica. API pública: `duplicarVertical(obj, pagina, ejeY?)` y `duplicarEnCuadrantes(obj, pagina, ejeY?)` — el `ejeY` opcional (en puntos) es la línea de plegado horizontal; si se omite, usa el centro. Internos: `duplicarHorizontal` y `rotarMediaVueltaConCorreccion` — los usa `duplicarEnCuadrantes`, no se exponen.
- **`MaquetarCompleto.jsx`** — variante **completo** (1-up): no duplica nada; solo dibuja las guías de verificación del papel (Tamaño 14 → corte en 274). Devuelve `[]`. API: `procesarElemento(obj, pagina, papel)`.
- **`MaquetarMedia.jsx`** — variante **media** (2-up): valida que el elemento esté sobre el eje de plegado, traza la guía de plegado + verificación, y duplica a la mitad inferior sin rotar. Devuelve `[copia]` o `null`. API: `procesarElemento(obj, pagina, papel)`, `validarObjetoBase`.
- **`MaquetarCuarto.jsx`** — variante **cuarto** (4-up): valida cuadrante superior izquierdo, traza ambos ejes + verificación, replica en 4 cuadrantes (inferiores rotados 180°). Devuelve el array de copias o `null`. API simétrica con Media. *(Validar antes de trazar evita guías huérfanas.)*
- **`MaquetacionPorCategoria.jsx`** — despachador. Recibe el **papel** (del modal). Para selección única mide/clasifica directo; para múltiple la **agrupa temporalmente**, mide el bounding box combinado, clasifica la **variante** contra `papel.obtenerCatalogo()` y al terminar **desagrupa todo** (grupo + copias) para no penalizar la impresión. Valida que la selección esté dentro de la página. Enruta vía `MANEJADORES[variante](obj, pagina, papel)`.
- **Para agregar un nuevo papel** (p. ej. otro tamaño): un solo archivo. En `papeles.js`: `crearPapel("Nombre", altoMm, verificacionMm?)`, sumarlo a `TODOS` y exportarlo. El modal se arma solo y las 3 variantes + handlers se reutilizan sin tocar nada más.
- **Para agregar una nueva variante**: (1) crear `MaquetarNueva.jsx` con `procesarElemento(obj, pagina, papel)`, (2) registrar `MANEJADORES[Papeles.VARIANTE.NUEVA] = MaquetarNueva.procesarElemento`, (3) agregar la variante al catálogo de cada papel en `papeles.js`, (4) incluir el `.jsx` antes del despachador.

### depuracion/
- **`Depuracion.jsx`** — registro en un array interno `LINEAS`. `mostrar()` crea un text frame debajo de la primera página. Modo `detallada` configurable desde `CONFIG`.
- **`DepuracionGeometrica.jsx`** — log detallado de bounds, centros, ancho/alto y rotaciones de un objeto y sus elementos internos (solo en modo detallado).

### ui/
- **`SelectorDePapel.jsx`** — modal ScriptUI (`Window("dialog")`). Se arma **dinámicamente desde `Papeles.todos()`** (un radio por papel), con `CONFIG.papelPorDefecto` preseleccionado. Devuelve el papel elegido o `null` si se cancela. Agregar un papel no requiere tocar este archivo.

### aplicacion/
- **`ValidacionDeEjecucion.jsx`** — precondiciones: documento abierto + selección existente.
- **`PresentacionDeResultados.jsx`** — volcado final: registra "--- Fin del proceso ---" y llama a `Depuracion.mostrar()`.
- **`Aplicacion.jsx`** — orquestador principal: inicia depuración → valida → **muestra el modal de papel** (si se cancela, termina) → ejecuta el flujo con el papel elegido (dentro de `ejecutarConUnidadesEnPuntos`) → finaliza, con try-catch global.

## Convenciones de nomenclatura

- **Archivos**: `.js` lowercase para núcleo puro; `.jsx` PascalCase para el adaptador InDesign del mismo módulo (co-localizados en la carpeta del dominio).
- **Variables/miembros privados**: `camelCase`. Prefijo opcional `_` para indicar privacidad dentro del módulo.
- **Funciones**: verbos en `camelCase` que describan la acción: `calcularCentroHorizontal`, `crearGuiaHorizontal`, `aplicarAccionSegunCategoria`.
- **Constantes**: `MAYUSCULAS_CON_GUIONES` o PascalCase según el caso (`CARTA`, `ORIENTACION_HORIZONTAL`).
- **Módulos/contextos**: PascalCase con verbo o sustantivo: `AdaptadorInDesign`, `ClasificacionDeFormato`, `MaquetarCuarto`, `SelectorDePapel`. El nombre debe describir lo que hace (p. ej. `CatalogoDeFormatos`, no `CalculoDeMedidas`).

## Manejo de enumeradores de InDesign

Los enumeradores nativos (`HorizontalOrVertical`, `MeasurementUnits`, `HorizontalOrientation`) pueden no estar disponibles en todas las versiones. Usar fallback progresivo:

```javascript
function obtenerOrientacionHorizontal() {
    if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.HORIZONTAL !== undefined)
        return HorizontalOrVertical.HORIZONTAL;
    if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.horizontal !== undefined)
        return HorizontalOrVertical.horizontal;
    return 1752332916; // FourCharCode numérico
}
```

## Manejo de unidades

- **No mezclar unidades** en operaciones de coordenadas. Preferir forzar a puntos temporalmente con `Unidades.ejecutarConUnidadesEnPuntos()`.
- `Page.bounds` retorna en las unidades actuales de regla (no necesariamente mm).
- `guide.location`, `geometricBounds`, `page.bounds` deben leerse/escribirse en la **misma** unidad para ser consistentes.
- `medirElementoEnMilimetros()` convierte a mm para alimentar el clasificador. A la inversa, `Unidades.convertirMilimetrosAPuntos()` posiciona guías en una medida absoluta en mm (eje de plegado 137 y verificación 274 del Tamaño 14) — siempre dentro del bloque forzado a puntos.

## Flujo de Aplicacion.ejecutar

```
iniciarDepuracion
  └── configurar(CONFIG) + limpiar + cabecera
ejecutarFlujoPrincipal
  └── ValidacionDeEjecucion.validar → si falla: return
  └── SelectorDePapel.elegir(papelPorDefecto) → modal; si cancela: return
  └── ejecutarConUnidadesEnPuntos (forzar reglas a puntos)
        └── MaquetacionPorCategoria.procesar(CONFIG, papel)
              └── medir selección → clasificar variante → enrutar al handler con el papel
finalizarDepuracion
  └── PresentacionDeResultados.mostrar → text frame bajo la página (si CONFIG.depuracion.mostrar)
(try-catch global captura errores fatales)
```

## Testing

El núcleo puro (`maquetar/<dominio>/*.js`) se testea con Jest:

```bash
npm test           # ejecuta todos los tests
npm run test:watch # modo watch
```

Los tests están en `tests/*.test.js`. Para mockear las constantes de InDesign que no existen en Node (`MeasurementUnits`, `HorizontalOrVertical`, el global `CatalogoDeFormatos`), se definen en el test antes del `require()`.

**No se testean** los módulos que dependen de la API de InDesign (`AdaptadorInDesign.jsx`, `Depuracion.jsx`, `TrazadoDeGuias.jsx`, los casos de uso de `maquetacion/`, etc.) — solo se prueban manualmente desde InDesign.

## Reglas generales

- **alert() solo para validación de entrada** que el usuario debe corregir (p. ej. en los casos de uso de `maquetacion/`, cuando el elemento está mal posicionado). Toda otra salida va a `Depuracion` (text frame). *Pendiente al crecer: mover estos `alert()` fuera del dominio y devolver errores estructurados para soportar lote.*
- **try-catch** alrededor de operaciones con la API de InDesign que puedan fallar. Registrar en `Depuracion` en lugar de mostrar alertas.
- **Configurable desde arriba**: `CONFIG` en la cabecera, inyectado a `Aplicacion.ejecutar(CONFIG)`. Los módulos internos no hardcodean valores.
- **Sin dependencias externas** en ExtendScript. Sin `$.evalFile`. Cada script es autocontenido: los módulos se cargan con `#include` desde el entry point (o se concatenan si `#include` no está disponible). Las dependencias npm (`jest`) son solo para desarrollo/testing.
