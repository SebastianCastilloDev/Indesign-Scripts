# Convenciones de código — Scripts InDesign (ExtendScript)

## Entorno

- El motor es **ExtendScript (ES3)** — sin `let`, `const`, arrow functions, template strings, clases, módulos ES.
- Los scripts se ejecutan desde el panel **Scripts** de InDesign (no desde ExtendScript Toolkit).
- Versión blanco: InDesign 20.0 (2026).

## Estructura del proyecto

Cada script autocontenido reside en un único `.jsx` en la raíz. Cuando un script excede ~50 líneas y tiene varias responsabilidades, se organiza en **módulos** autocontenidos mediante **IIFEs** (Immediately Invoked Function Expressions), cada uno en su propio archivo dentro de una carpeta con el mismo nombre del script raíz.

```
var Contexto = (function() {
    // estado privado
    // funciones internas
    return { funcionPublica: funcionPublica };
})();
```

### Dual export pattern (lib/ + .jsx)

La lógica pura (sin API de InDesign) vive en `maquetar/lib/*.js` con doble export:

```javascript
var MiModulo = (function() { /* ... */ })();
if (typeof module !== "undefined" && module.exports) {
    module.exports = MiModulo;
}
```

Esto permite:
- `#include` desde los `.jsx` (ExtendScript lo interpreta como texto plano y define la variable global)
- `require()` desde Node.js para tests con Jest

Los archivos `.jsx` son wrappers delgados que incluyen el `lib/` correspondiente:

```
// maquetar/CalculoDeMedidas.jsx
#include "lib/calculoDeMedidas.js"
```

Cuando un módulo tiene lógica pura + funciones que dependen de la API de InDesign (ej. `Unidades`), el `.jsx` hace `#include` del `lib/` y luego agrega las funciones InDesign-dependent.

### Orden de inclusión

Los `#include` deben respetar el grafo de dependencias. Orden actual en `maquetar.jsx`:

1. `maquetar/Unidades.jsx` → incluye `lib/unidades.js` — sin dependencias
2. `maquetar/CalculoDeMedidas.jsx` → incluye `lib/calculoDeMedidas.js` — sin dependencias
3. `maquetar/ClasificacionDeFormato.jsx` → incluye `lib/clasificacionDeFormato.js` → CalculoDeMedidas
4. `maquetar/lib/validarSuperposicion.js` — sin dependencias
5. `maquetar/AdaptadorInDesign.jsx` → Unidades
6. `maquetar/Depuracion.jsx` → Unidades, AdaptadorInDesign
7. `maquetar/TrazadoDeGuias.jsx` → Unidades, AdaptadorInDesign, Depuracion
8. `maquetar/ValidacionDeEjecucion.jsx` → AdaptadorInDesign, Depuracion
9. `maquetar/MaquetacionPorCategoria.jsx` → AdaptadorInDesign, ClasificacionDeFormato, Depuracion, TrazadoDeGuias, ValidarSuperposicion
10. `maquetar/PresentacionDeResultados.jsx` → Depuracion
11. `maquetar/Aplicacion.jsx` → todos los anteriores

Si un `#include` falla (p. ej. en InDesign 2025 o anterior que no lo soporte desde el panel Scripts), concatenar manualmente el contenido de los módulos directamente en el entry point.

## Módulos (maquetar/)

### `maquetar/lib/unidades/unidades.js`
Núcleo puro de conversión entre unidades y mm. Define `FACTOR_A_MM` y expone `convertirAMilimetros()`, `convertirPuntosAMilimetros()`. El `.jsx` agrega las funciones InDesign-dependent (`obtenerUnidadHorizontal`, `ejecutarConUnidadesEnPuntos`).

### `maquetar/Unidades.jsx`
Wrapper que incluye `lib/unidades/unidades.js` y agrega la capa InDesign: lectura de `viewPreferences`, forzado temporal de unidades a puntos con `ejecutarConUnidadesEnPuntos()`.

### `maquetar/lib/formatos/calculoDeMedidas.js`
Catálogo de tamaños: **Carta** (215.9×279.4 mm), **Media Carta** (mitad del alto de Carta × ancho de Carta), **Cuarto Carta** (media anchura × media altura). Expone `obtenerCatalogo()` para alimentar al clasificador.

### `maquetar/CalculoDeMedidas.jsx`
Wrapper delgado que incluye `lib/formatos/calculoDeMedidas.js`.

### `maquetar/lib/formatos/clasificacionDeFormato.js`
Lógica pura de clasificación. Recibe dimensiones en mm y tolerancias, compara contra el catálogo (directo y rotado), retorna el nombre de la categoría de menor área que cabe. Si ningún formato cabe, retorna `null`.

### `maquetar/ClasificacionDeFormato.jsx`
Wrapper delgado que incluye `lib/formatos/clasificacionDeFormato.js`.

### `maquetar/lib/geometria/validarSuperposicion.js`
Lógica pura de geometría. `validarSuperposicionObjetoConLineaGuia(obj, pagina)` verifica si un elemento cruza el centro de página donde se trazarían las guías. Retorna `"horizontal"`, `"vertical"`, `"ambas"` o `null`.

### `maquetar/lib/geometria/trazadoDeGuias.js`
Cálculo puro del centro de página. Expone `calcularCentroHorizontal(pagina)` y `calcularCentroVertical(pagina)`.

### `maquetar/TrazadoDeGuias.jsx`
Wrapper que incluye `lib/geometria/trazadoDeGuias.js` y agrega la capa InDesign: `trazarSoloHorizontal(pagina)` y `trazarAmbosEjes(pagina)` que crean las guías usando `AdaptadorInDesign`.

### `maquetar/lib/adaptadores/adaptadorInDesign.js`
Resolución de FourCharCodes de orientación con fallback progresivo. Expone `obtenerOrientacionHorizontal()` y `obtenerOrientacionVertical()`.

### `maquetar/AdaptadorInDesign.jsx`
Capa de infraestructura. Incluye `lib/adaptadores/adaptadorInDesign.js` y agrega toda la interacción con la API de InDesign: verificar documento/selección, leer `geometricBounds`, crear guías, crear marcos de texto.

### `maquetar/Depuracion.jsx`
Registro de mensajes en un array interno `LINEAS`. Al llamar `mostrar()`, crea un text frame debajo de la primera página con hasta 20 líneas de contenido. Sin `alert()` — toda salida va aquí.

### `maquetar/ValidacionDeEjecucion.jsx`
Validación de precondiciones: documento abierto y selección existente. Retorna `false` si alguna falla y registra el error en `Depuracion`.

### `maquetar/MaquetacionPorCategoria.jsx`
Orquestación del análisis de cada elemento seleccionado: mide dimensiones, clasifica y aplica la acción según categoría (guía horizontal para Media Carta, ambos ejes para Cuarto Carta). Antes de trazar guías, valida con `ValidarSuperposicion` que el elemento no esté sobre la posición donde se trazaría la guía; si lo está, muestra `alert()` y omite el trazado. Cada elemento se procesa con try-catch individual.

### `maquetar/PresentacionDeResultados.jsx`
Volcado final de resultados. Simplemente agrega "--- Fin del proceso ---" y llama a `Depuracion.mostrar()`.

### `maquetar/Aplicacion.jsx`
Orquestador principal único. Coordina el flujo completo: inicia depuración, ejecuta el flujo principal (con `ejecutarConUnidadesEnPuntos`), finaliza depuración, y captura errores fatales con try-catch global.

## Convenciones de nomenclatura

- **Variables/miembros privados**: `camelCase`. Prefijo opcional `_` para indicar privacidad dentro del módulo.
- **Funciones**: verbos en `camelCase` que describan la acción: `calcularCentroPagina`, `crearGuiaHorizontal`, `aplicarMaquetacionSegunCategoria`.
- **Constantes**: `MAYUSCULAS_CON_GUIONES` o PascalCase según el caso (`CARTA`, `ORIENTACION_HORIZONTAL`).
- **Módulos/contextos**: PascalCase con verbo o sustantivo: `AdaptadorInDesign`, `ClasificacionDeFormato`, `ValidacionDeEjecucion`.

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
  └── limpiar + registrar cabecera
validarEntorno
  └── validarDocumento + validarSeleccion → si falla: mostrarDepuracion y return
configurarProcesos
  └── pasa CONFIG a MaquetacionPorCategoria
ejecutarFlujoPrincipal
  └── ejecutarConUnidadesEnPuntos (forzar reglas a puntos)
      └── procesarSeleccion → para cada elemento: analizar + aplicar accion segun categoria
  └── mostrarResultados
finalizarDepuracion
  └── crear text frame debajo de la página
```

## Testing

Los módulos de lógica pura en `maquetar/lib/*.js` se testean con Jest.

```bash
npm test          # ejecuta todos los tests
npm run test:watch # modo watch
```

Los tests están en `tests/*.test.js`. Para mockear las constantes de InDesign que no existen en Node (`MeasurementUnits`), se definen en el test antes del `require()`.

**No se testean** los módulos que dependen de la API de InDesign (`AdaptadorInDesign`, `Depuracion`, `TrazadoDeGuias`, etc.) — solo se prueban manualmente desde InDesign.

## Reglas generales

- **Sin alert()** (salvo la excepción documentada en `MaquetacionPorCategoria` donde el usuario lo solicitó explícitamente). Toda salida va al módulo `Depuracion`, que crea un text frame.
- **try-catch** alrededor de operaciones con la API de InDesign que puedan fallar. Registrar en `Depuracion` en lugar de mostrar alertas.
- **Configurable desde arriba**: `CONFIG` en la cabecera, inyectado a `Aplicacion.ejecutar(CONFIG)`. Los módulos internos no hardcodean valores.
- **Sin dependencias externas** en ExtendScript. Sin `$.evalFile`. Cada script es autocontenido: los módulos se cargan con `#include` desde el entry point (o se concatenan si `#include` no está disponible). Las dependencias npm (`jest`) son solo para desarrollo/testing.
