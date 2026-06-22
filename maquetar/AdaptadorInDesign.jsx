var AdaptadorInDesign = (function() {

    var ORIENTACION_HORIZONTAL = obtenerOrientacionHorizontal();
    var ORIENTACION_VERTICAL = obtenerOrientacionVertical();

    function obtenerOrientacionHorizontal() {
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.HORIZONTAL !== undefined) return HorizontalOrVertical.HORIZONTAL;
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.horizontal !== undefined) return HorizontalOrVertical.horizontal;
        return 1752332916;
    }

    function obtenerOrientacionVertical() {
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.VERTICAL !== undefined) return HorizontalOrVertical.VERTICAL;
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.vertical !== undefined) return HorizontalOrVertical.vertical;
        return 1986359924;
    }

    function hayDocumentoAbierto() {
        return app.documents.length > 0;
    }

    function haySeleccion() {
        return app.selection.length > 0;
    }

    function obtenerSeleccion() {
        return app.selection;
    }

    function obtenerPaginaActiva() {
        return app.activeWindow.activePage;
    }

    function obtenerBounds(obj) {
        return obj.geometricBounds;
    }

    function medirElementoEnMilimetros(obj) {
        var bounds = obtenerBounds(obj);
        var unidadHorizontal = Unidades.obtenerUnidadHorizontal();
        var unidadVertical = Unidades.obtenerUnidadVertical();

        return {
            ancho: Unidades.convertirAMilimetros(Math.abs(bounds[3] - bounds[1]), unidadHorizontal),
            alto: Unidades.convertirAMilimetros(Math.abs(bounds[2] - bounds[0]), unidadVertical)
        };
    }

    function crearGuia(pagina, orientacion, posicion) {
        var guia = pagina.guides.add();
        guia.orientation = orientacion;
        guia.location = posicion;
        return guia;
    }

    function crearGuiaHorizontal(pagina, posicionY) {
        return crearGuia(pagina, ORIENTACION_HORIZONTAL, posicionY);
    }

    function crearGuiaVertical(pagina, posicionX) {
        return crearGuia(pagina, ORIENTACION_VERTICAL, posicionX);
    }

    function crearMarcoTexto(pagina, bounds, contenido, puntoTexto) {
        var marco = pagina.textFrames.add();
        marco.geometricBounds = bounds;
        marco.contents = contenido;
        marco.texts[0].pointSize = puntoTexto;
        return marco;
    }

    function obtenerPrimeraPagina() {
        return app.activeDocument.pages[0];
    }

    return {
        hayDocumentoAbierto: hayDocumentoAbierto,
        haySeleccion: haySeleccion,
        obtenerSeleccion: obtenerSeleccion,
        obtenerPaginaActiva: obtenerPaginaActiva,
        medirElementoEnMilimetros: medirElementoEnMilimetros,
        crearGuiaHorizontal: crearGuiaHorizontal,
        crearGuiaVertical: crearGuiaVertical,
        crearMarcoTexto: crearMarcoTexto,
        obtenerPrimeraPagina: obtenerPrimeraPagina
    };

})();
