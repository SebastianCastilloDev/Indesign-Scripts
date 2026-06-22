// ====================================================================
// NUCLEO PURO (resolución de enumeradores)
// ====================================================================

#include "lib/adaptadores/adaptadorInDesign.js"

// ====================================================================
// CAPA InDesign (API-dependent)
// ====================================================================

(function() {

    var ORIENTACION_HORIZONTAL = AdaptadorInDesign.obtenerOrientacionHorizontal();
    var ORIENTACION_VERTICAL = AdaptadorInDesign.obtenerOrientacionVertical();

    AdaptadorInDesign.hayDocumentoAbierto = function() {
        return app.documents.length > 0;
    };

    AdaptadorInDesign.haySeleccion = function() {
        return app.selection.length > 0;
    };

    AdaptadorInDesign.obtenerSeleccion = function() {
        return app.selection;
    };

    AdaptadorInDesign.obtenerPaginaActiva = function() {
        return app.activeWindow.activePage;
    };

    AdaptadorInDesign.obtenerBounds = function(obj) {
        return obj.geometricBounds;
    };

    AdaptadorInDesign.agruparElementos = function(elementos) {
        return app.activeDocument.groups.add(elementos);
    };

    AdaptadorInDesign.medirElementoEnMilimetros = function(obj) {
        var bounds = AdaptadorInDesign.obtenerBounds(obj);
        var unidadHorizontal = Unidades.obtenerUnidadHorizontal();
        var unidadVertical = Unidades.obtenerUnidadVertical();

        return {
            ancho: Unidades.convertirAMilimetros(Math.abs(bounds[3] - bounds[1]), unidadHorizontal),
            alto: Unidades.convertirAMilimetros(Math.abs(bounds[2] - bounds[0]), unidadVertical)
        };
    };

    function crearGuia(pagina, orientacion, posicion) {
        var guia = pagina.guides.add();
        guia.orientation = orientacion;
        guia.location = posicion;
        return guia;
    }

    AdaptadorInDesign.crearGuiaHorizontal = function(pagina, posicionY) {
        return crearGuia(pagina, ORIENTACION_HORIZONTAL, posicionY);
    };

    AdaptadorInDesign.crearGuiaVertical = function(pagina, posicionX) {
        return crearGuia(pagina, ORIENTACION_VERTICAL, posicionX);
    };

    AdaptadorInDesign.crearMarcoTexto = function(pagina, bounds, contenido, puntoTexto) {
        var marco = pagina.textFrames.add();
        marco.geometricBounds = bounds;
        marco.contents = contenido;
        marco.texts[0].pointSize = puntoTexto;
        return marco;
    };

    AdaptadorInDesign.obtenerPrimeraPagina = function() {
        return app.activeDocument.pages[0];
    };

})();
