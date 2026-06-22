// ====================================================================
// MÓDULO: Medidas
// ====================================================================

var Medidas = (function() {

    var CARTA = {
        nombre: "Carta",
        ancho: 215.9,
        alto: 279.4
    };

    function calcularMediaCarta() {
        return {
            nombre: "Media Carta",
            ancho: CARTA.alto / 2,
            alto: CARTA.ancho
        };
    }

    function calcularCuartoCarta() {
        return {
            nombre: "Cuarto Carta",
            ancho: CARTA.ancho / 2,
            alto: CARTA.alto / 2
        };
    }

    var MEDIA_CARTA = calcularMediaCarta();
    var CUARTO_CARTA = calcularCuartoCarta();

    var toleranciaHorizontal = 2;
    var toleranciaVertical = 2;

    return {
        CARTA: CARTA,
        MEDIA_CARTA: MEDIA_CARTA,
        CUARTO_CARTA: CUARTO_CARTA,
        toleranciaHorizontal: toleranciaHorizontal,
        toleranciaVertical: toleranciaVertical,
        obtenerCatalogo: function() {
            return [CARTA, MEDIA_CARTA, CUARTO_CARTA];
        }
    };

})();

// ====================================================================
// MÓDULO: Clasificador
// ====================================================================

var Clasificador = (function() {

    function calcularArea(ancho, alto) {
        return ancho * alto;
    }

    function cabeEnDimension(ancho, alto, refAncho, refAlto, tolH, tolV) {
        return (ancho <= refAncho + tolH && alto <= refAlto + tolV);
    }

    function determinarTamanio(ancho, alto, catalogo, tolH, tolV) {
        var mejor = null;
        var menorArea = Infinity;

        for (var i = 0; i < catalogo.length; i++) {
            var t = catalogo[i];
            var areaRef = calcularArea(t.ancho, t.alto);

            var entraDirecto = cabeEnDimension(ancho, alto, t.ancho, t.alto, tolH, tolV);
            var entraRotado = cabeEnDimension(ancho, alto, t.alto, t.ancho, tolH, tolV);

            if (entraDirecto || entraRotado) {
                if (areaRef < menorArea) {
                    menorArea = areaRef;
                    mejor = t.nombre;
                }
            }
        }
        return mejor;
    }

    return {
        clasificar: function(ancho, alto) {
            var catalogo = Medidas.obtenerCatalogo();
            var tolH = Medidas.toleranciaHorizontal;
            var tolV = Medidas.toleranciaVertical;
            return determinarTamanio(ancho, alto, catalogo, tolH, tolV);
        }
    };

})();

// ====================================================================
// MÓDULO: InDesign
// ====================================================================

var InDesign = (function() {

    function hayDocumentoAbierto() {
        return app.documents.length > 0;
    }

    function hayElementosSeleccionados() {
        return app.selection.length > 0;
    }

    function obtenerSeleccionActual() {
        return app.selection;
    }

    function medirElemento(obj) {
        var bounds = obj.geometricBounds;
        return {
            ancho: Math.abs(bounds[3] - bounds[1]),
            alto: Math.abs(bounds[2] - bounds[0])
        };
    }

    return {
        hayDocumentoAbierto: hayDocumentoAbierto,
        hayElementosSeleccionados: hayElementosSeleccionados,
        obtenerSeleccionActual: obtenerSeleccionActual,
        medirElemento: medirElemento
    };

})();

// ====================================================================
// MÓDULO: Presentador
// ====================================================================

var Presentador = (function() {

    function formatearResultados(resultados) {
        var lineas = [];
        for (var i = 0; i < resultados.length; i++) {
            var r = resultados[i];
            lineas.push("Elemento " + r.indice + ": " + r.categoria + " (" + r.ancho.toFixed(2) + " x " + r.alto.toFixed(2) + ")");
        }
        return lineas.join("\n");
    }

    function mostrarMensaje(mensaje) {
        alert(mensaje);
    }

    return {
        formatearResultados: formatearResultados,
        mostrarMensaje: mostrarMensaje
    };

})();

// ====================================================================
// ORQUESTADOR
// ====================================================================

function ejecutar() {

    if (!InDesign.hayDocumentoAbierto()) {
        Presentador.mostrarMensaje("No hay ningún documento abierto.");
        return;
    }

    if (!InDesign.hayElementosSeleccionados()) {
        Presentador.mostrarMensaje("No hay ningún elemento seleccionado.");
        return;
    }

    var seleccion = InDesign.obtenerSeleccionActual();
    var resultados = [];

    for (var i = 0; i < seleccion.length; i++) {
        var dim = InDesign.medirElemento(seleccion[i]);
        var categoria = Clasificador.clasificar(dim.ancho, dim.alto);
        resultados.push({
            indice: i + 1,
            categoria: categoria || "Sin categoría",
            ancho: dim.ancho,
            alto: dim.alto
        });
    }

    var mensaje = Presentador.formatearResultados(resultados);
    Presentador.mostrarMensaje(mensaje);
}

// ====================================================================
// ENTRY POINT
// ====================================================================

ejecutar();
