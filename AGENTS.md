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

El archivo raíz (entry point) es delgado: solo contiene la configuración (`CONFIG`), los `#include` de los módulos en orden de dependencia, y la llamada al orquestador.

```
// maquetar.jsx
var CONFIG = { ... };
#include "maquetar/Unidades.jsx"
#include "maquetar/CalculoDeMedidas.jsx"
...
Aplicacion.ejecutar(CONFIG);
```

### Orden de inclusión

Los `#include` deben respetar el grafo de dependencias. El orden actual para `maquetar/`:

1. `Unidades.jsx` — sin dependencias
2. `CalculoDeMedidas.jsx` — sin dependencias
3. `ClasificacionDeFormato.jsx` → CalculoDeMedidas
4. `AdaptadorInDesign.jsx` → Unidades
5. `Depuracion.jsx` → Unidades, AdaptadorInDesign
6. `TrazadoDeGuias.jsx` → Unidades, AdaptadorInDesign, Depuracion
7. `ValidacionDeEjecucion.jsx` → AdaptadorInDesign, Depuracion
8. `MaquetacionPorCategoria.jsx` → AdaptadorInDesign, ClasificacionDeFormato, Depuracion, TrazadoDeGuias
9. `PresentacionDeResultados.jsx` → Depuracion
10. `Aplicacion.jsx` → todos los anteriores

Si un `#include` falla (p. ej. en InDesign 2025 o anterior que no lo soporte desde el panel Scripts), concatenar manualmente el contenido de los módulos directamente en el entry point.

## Módulos (maquetar/)

### `maquetar/Unidades.jsx`
Conversión entre unidades de InDesign y mm. Ofrece `ejecutarConUnidadesEnPuntos()` que fuerza las reglas del documento a puntos temporalmente, ejecuta una función y restaura las unidades originales. Las constantes de conversión se almacenan en `FACTOR_A_MM`.

### `maquetar/CalculoDeMedidas.jsx`
Catálogo de tamaños: **Carta** (215.9×279.4 mm), **Media Carta** (mitad del alto de Carta × ancho de Carta), **Cuarto Carta** (media anchura × media altura). Expone `obtenerCatalogo()` para alimentar al clasificador.

### `maquetar/ClasificacionDeFormato.jsx`
Lógica pura de clasificación. Recibe dimensiones en mm y tolerancias, compara contra el catálogo (directo y rotado), retorna el nombre de la categoría de menor área que cabe. Si ningún formato cabe, retorna `null`.

### `maquetar/AdaptadorInDesign.jsx`
Capa de infraestructura. Toda interacción directa con la API de InDesign: verificar documento/selección, leer `geometricBounds`, crear guías (con fallback progresivo de `HorizontalOrVertical`), crear marcos de texto. Los FourCharCodes de orientación se resuelven una vez al cargar el módulo.

### `maquetar/Depuracion.jsx`
Registro de mensajes en un array interno `LINEAS`. Al llamar `mostrar()`, crea un text frame debajo de la primera página con hasta 20 líneas de contenido. Sin `alert()` — toda salida va aquí.

### `maquetar/TrazadoDeGuias.jsx`
Cálculo del centro de la página activa (horizontal y vertical) y creación de guías. Ofrece `trazarSoloHorizontal(pagina)` y `trazarAmbosEjes(pagina)`. Las coordenadas se calculan desde `page.bounds`.

### `maquetar/ValidacionDeEjecucion.jsx`
Validación de precondiciones: documento abierto y selección existente. Retorna `false` si alguna falla y registra el error en `Depuracion`.

### `maquetar/MaquetacionPorCategoria.jsx`
Orquestación del análisis de cada elemento seleccionado: mide dimensiones, clasifica y aplica la acción según categoría (guía horizontal para Media Carta, ambos ejes para Cuarto Carta). Cada elemento se procesa con try-catch individual.

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

## Reglas generales

- **Sin alert()**. Toda salida va al módulo `Depuracion`, que crea un text frame.
- **try-catch** alrededor de operaciones con la API de InDesign que puedan fallar. Registrar en `Depuracion` en lugar de mostrar alertas.
- **Configurable desde arriba**: `CONFIG` en la cabecera, inyectado a `Aplicacion.ejecutar(CONFIG)`. Los módulos internos no hardcodean valores.
- **Sin dependencias externas**. Sin `$.evalFile`. Cada script es autocontenido: los módulos se cargan con `#include` desde el entry point (o se concatenan si `#include` no está disponible).
