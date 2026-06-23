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
      catalogoDeFormatos.js       puro: catálogo de tamaños de papel
      clasificacionDeFormato.js   puro: clasifica dimensiones → categoría
      CatalogoDeFormatos.jsx      wrapper
      ClasificacionDeFormato.jsx  wrapper
    geometria/
      bounds.js                   puro: primitivas de bounds (top/left/bottom/right, centros, zonas)
      validarSuperposicion.js     puro: ¿el elemento cruza el centro de página?
      trazadoDeGuias.js           puro: cálculo de centros de página
      TrazadoDeGuias.jsx          adaptador: crea las guías en InDesign
    indesign/
      adaptadorInDesign.js        puro: resolución de FourCharCodes de orientación
      AdaptadorInDesign.jsx       adaptador: toda la API de InDesign (selección, bounds, guías, grupos…)
    maquetacion/
      RepeticionDeCuadrantes.jsx  duplicación/rotación geométrica entre cuadrantes
      MaquetarMediaCarta.jsx      caso de uso: imposición Media Carta (duplica a la mitad inferior)
      MaquetarCuartoCarta.jsx     caso de uso: imposición Cuarto Carta (4 cuadrantes con rotación)
      MaquetacionPorCategoria.jsx despacha cada elemento al caso de uso según su categoría
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
4. `geometria/bounds.js` — sin dependencias
5. `geometria/validarSuperposicion.js` → Bounds
6. `indesign/AdaptadorInDesign.jsx` → Unidades
7. `depuracion/Depuracion.jsx` → AdaptadorInDesign
8. `depuracion/DepuracionGeometrica.jsx` → Depuracion, Bounds
9. `geometria/TrazadoDeGuias.jsx` → AdaptadorInDesign, Depuracion, Bounds
10. `aplicacion/ValidacionDeEjecucion.jsx` → AdaptadorInDesign, Depuracion
11. `maquetacion/RepeticionDeCuadrantes.jsx` → Bounds, Depuracion, DepuracionGeometrica
12. `maquetacion/MaquetarMediaCarta.jsx` → Bounds, ValidarSuperposicion, TrazadoDeGuias, RepeticionDeCuadrantes, Depuracion
13. `maquetacion/MaquetarCuartoCarta.jsx` → Bounds, ValidarSuperposicion, TrazadoDeGuias, RepeticionDeCuadrantes, Depuracion
14. `maquetacion/MaquetacionPorCategoria.jsx` → CatalogoDeFormatos, ClasificacionDeFormato, MaquetarMediaCarta, MaquetarCuartoCarta, AdaptadorInDesign, Depuracion
15. `aplicacion/PresentacionDeResultados.jsx` → Depuracion
16. `aplicacion/Aplicacion.jsx` → todos los anteriores

Si un `#include` falla (p. ej. en InDesign 2025 o anterior que no lo soporte desde el panel Scripts), concatenar manualmente el contenido de los módulos directamente en el entry point.

## Módulos por dominio

### unidades/
- **`unidades.js`** — núcleo puro de conversión a mm. Define `FACTOR_A_MM` y expone `convertirAMilimetros()`, `convertirPuntosAMilimetros()`.
- **`Unidades.jsx`** — agrega la capa InDesign: lectura de `viewPreferences` y forzado temporal de reglas a puntos con `ejecutarConUnidadesEnPuntos()` (guarda/restaura en `finally`).

### formatos/
- **`catalogoDeFormatos.js`** — catálogo de tamaños: **Carta** (215.9×279.4 mm), **Media Carta** (mitad del alto de Carta × ancho de Carta), **Cuarto Carta** (media anchura × media altura). Expone `obtenerCatalogo()`.
- **`clasificacionDeFormato.js`** — recibe dimensiones en mm + tolerancias, compara contra el catálogo (directo y rotado) y retorna el nombre de la categoría de menor área que cabe, o `null`. Depende del global `CatalogoDeFormatos`.
- **`CatalogoDeFormatos.jsx` / `ClasificacionDeFormato.jsx`** — wrappers delgados (`#include` del `.js`).

### geometria/
- **`bounds.js`** — primitivas de geometría puras. `deObjeto(obj)` y `dePagina(pagina)` convierten arrays de bounds a `{top, left, bottom, right}`. Helpers: `centroX`, `centroY`, `ancho`, `alto`, `estaEnMitadSuperior`, `estaEnCuadranteSuperiorIzquierdo`, `estaFueraDePagina`. Todos los módulos que necesiten trabajar con coordenadas usan este módulo — nunca índices mágicos `[0]`/`[1]`/`[2]`/`[3]` directamente.
- **`validarSuperposicion.js`** — `validarSuperposicionObjetoConLineaGuia(obj, pagina)`: ¿el elemento cruza el centro de página donde se trazaría la guía? Retorna `"horizontal"`, `"vertical"`, `"ambas"` o `null`. Usa `Bounds`.
- **`trazadoDeGuias.js`** — cálculo puro de centros via `Bounds`: `calcularCentroHorizontal(pagina)`, `calcularCentroVertical(pagina)`.
- **`TrazadoDeGuias.jsx`** — agrega la capa InDesign: `trazarSoloHorizontal()` y `trazarAmbosEjes()` crean las guías vía `AdaptadorInDesign`.

### indesign/
- **`adaptadorInDesign.js`** — resolución de FourCharCodes de orientación con fallback progresivo: `obtenerOrientacionHorizontal()`, `obtenerOrientacionVertical()`.
- **`AdaptadorInDesign.jsx`** — capa de infraestructura: toda la interacción con `app` (documento/selección, `geometricBounds`, agrupar/desagrupar, crear guías y marcos de texto, medir en mm).

### maquetacion/
- **`RepeticionDeCuadrantes.jsx`** — duplicación geométrica: `duplicarHorizontal`, `duplicarVertical`, `duplicarEnCuadrantes` (4-up) y `rotarMediaVueltaConCorreccion` (180° + corrección de posición).
- **`MaquetarMediaCarta.jsx`** — caso de uso Media Carta: valida que el elemento esté en la mitad superior, **luego** traza la guía horizontal y lo duplica a la mitad inferior sin rotar. Devuelve `[copia]` o `null` si la validación falla. API pública: `procesarElemento`, `validarObjetoBase`.
- **`MaquetarCuartoCarta.jsx`** — caso de uso Cuarto Carta: valida que el elemento esté en el cuadrante superior izquierdo, **luego** traza ambos ejes y lo replica en los 4 cuadrantes (inferiores rotados 180°). Devuelve el array de copias o `null`. API pública simétrica con Media Carta: `procesarElemento`, `validarObjetoBase`. *(Validar antes de trazar evita dejar guías huérfanas si la posición es inválida.)*
- **`MaquetacionPorCategoria.jsx`** — despachador. Para selección única mide/clasifica el elemento directo; para selección múltiple lo **agrupa temporalmente**, mide el bounding box combinado, clasifica y, al terminar, **desagrupa el grupo y todas las copias** para no penalizar el rendimiento de impresión. Valida que la selección esté dentro de la página antes de procesar. Enruta al handler via el **registro `MANEJADORES`** (`categoría → función`). Cada caso se procesa con try-catch.
- **Para agregar un nuevo formato**: (1) crear `MaquetarNuevoFormato.jsx` en `maquetacion/`, (2) agregar el tamaño en `catalogoDeFormatos.js`, (3) registrar `MANEJADORES[CatalogoDeFormatos.NUEVO.nombre] = MaquetarNuevoFormato.procesarElemento` en `MaquetacionPorCategoria`, (4) incluir el `.jsx` en `maquetar.jsx` antes del despachador.

### depuracion/
- **`Depuracion.jsx`** — registro en un array interno `LINEAS`. `mostrar()` crea un text frame debajo de la primera página. Modo `detallada` configurable desde `CONFIG`.
- **`DepuracionGeometrica.jsx`** — log detallado de bounds, centros, ancho/alto y rotaciones de un objeto y sus elementos internos (solo en modo detallado).

### aplicacion/
- **`ValidacionDeEjecucion.jsx`** — precondiciones: documento abierto + selección existente.
- **`PresentacionDeResultados.jsx`** — volcado final: registra "--- Fin del proceso ---" y llama a `Depuracion.mostrar()`.
- **`Aplicacion.jsx`** — orquestador principal: inicia depuración → ejecuta el flujo (dentro de `ejecutarConUnidadesEnPuntos`) → finaliza, con try-catch global para errores fatales.

## Convenciones de nomenclatura

- **Archivos**: `.js` lowercase para núcleo puro; `.jsx` PascalCase para el adaptador InDesign del mismo módulo (co-localizados en la carpeta del dominio).
- **Variables/miembros privados**: `camelCase`. Prefijo opcional `_` para indicar privacidad dentro del módulo.
- **Funciones**: verbos en `camelCase` que describan la acción: `calcularCentroHorizontal`, `crearGuiaHorizontal`, `aplicarAccionSegunCategoria`.
- **Constantes**: `MAYUSCULAS_CON_GUIONES` o PascalCase según el caso (`CARTA`, `ORIENTACION_HORIZONTAL`).
- **Módulos/contextos**: PascalCase con verbo o sustantivo: `AdaptadorInDesign`, `ClasificacionDeFormato`, `MaquetarCuartoCarta`. El nombre debe describir lo que hace (p. ej. `CatalogoDeFormatos`, no `CalculoDeMedidas`).

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
- La conversión a mm solo ocurre en `medirElementoEnMilimetros()` para alimentar el clasificador; nunca se usa para posicionar guías.

## Flujo de Aplicacion.ejecutar

```
iniciarDepuracion
  └── configurar(CONFIG) + limpiar + cabecera
ejecutarFlujoPrincipal
  └── ValidacionDeEjecucion.validar → si falla: return
  └── ejecutarConUnidadesEnPuntos (forzar reglas a puntos)
        └── MaquetacionPorCategoria.procesar(CONFIG)
              └── por cada elemento: medir → clasificar → enrutar al caso de uso
finalizarDepuracion
  └── PresentacionDeResultados.mostrar → text frame bajo la página
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
