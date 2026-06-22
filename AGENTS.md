# Convenciones de código — Scripts InDesign (ExtendScript)

## Entorno

- El motor es **ExtendScript (ES3)** — sin `let`, `const`, arrow functions, template strings, clases, módulos ES.
- Los scripts se ejecutan desde el panel **Scripts** de InDesign (no desde ExtendScript Toolkit).
- Versión blanco: InDesign 20.0 (2026).

## Estructura del proyecto

Cada script autocontenido reside en un único `.jsx`. Cuando un script excede ~50 líneas y tiene varias responsabilidades, se organiza en **bounded contexts** autocontenidos mediante **IIFEs** (Immediately Invoked Function Expressions).

```
var Contexto = (function() {
    // estado privado
    // funciones internas
    return { funcionPublica: funcionPublica };
})();
```

## Bounded contexts (maquetar.jsx)

1. **CalculoDeMedidas** — constantes de tamaño, catálogo, derivación (Media Carta, Cuarto Carta desde Carta).
2. **ClasificacionDeFormato** — lógica pura de clasificación: recibe dimensiones+tolerancias, compara contra el catálogo, retorna nombre de categoría.
3. **Unidades** — conversión entre unidades del documento y mm/puntos; ofrece `ejecutarConUnidadesEnPuntos()` que fuerza unidades temporales para evitar inconsistencias.
4. **AdaptadorInDesign** — capa de infraestructura: toda interacción directa con la API de InDesign (guias, selección, marcos de texto, bounds).
5. **Depuracion** — registro de mensajes en un text frame debajo de la primera página.
6. **TrazadoDeGuias** — cálculo de centro de página y creación de guías (horizontal y/o vertical).
7. **ValidacionDeEjecucion** — validación de precondiciones (documento abierto, selección existente).
8. **MaquetacionPorCategoria** — orquestación del análisis de cada elemento y aplicación de acciones según categoría.
9. **PresentacionDeResultados** — volcado de resultados al depurador.
10. **Aplicacion** — orquestador principal único: `iniciarDepuracion → validarEntorno → configurarProcesos → ejecutarFlujoPrincipal → finalizarDepuracion`.

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
  └── procesarSeleccion → para cada elemento: analizar + aplicar accion segun categoria
  └── mostrarResultados
finalizarDepuracion
  └── crear text frame debajo de la página
```

## Reglas generales

- **Sin alert()**. Toda salida va al módulo `Depuracion`, que crea un text frame.
- **try-catch** alrededor de operaciones con la API de InDesign que puedan fallar. Registrar en `Depuracion` en lugar de mostrar alertas.
- **Configurable desde arriba**: `CONFIG` en la cabecera, inyectado a `Aplicacion.ejecutar(CONFIG)`. Los módulos internos no hardcodean valores.
- **Sin dependencias externas**. Sin `#include`, sin `$.evalFile`. Cada script es un único archivo autocontenido.
