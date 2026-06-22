var Depuracion = (function() {

    var LINEAS = [];
    var LINEA_PUNTO = 8;
    var CANTIDAD_LINEAS_MOSTRAR = 1000;

    function limpiar() {
        LINEAS = [];
    }

    function registrar(texto) {
        LINEAS.push(texto);
    }

    function obtenerLineas() {
        return LINEAS;
    }

    function mostrar() {
        try {
            if (!AdaptadorInDesign.hayDocumentoAbierto()) return;
            var pagina = AdaptadorInDesign.obtenerPrimeraPagina();
            var boundsPagina = pagina.bounds;
            var margenInferior = 10;
            var altoTexto = LINEA_PUNTO * 1.5 * Math.min(LINEAS.length, CANTIDAD_LINEAS_MOSTRAR);
            var x1 = boundsPagina[1] + 10;
            var y1 = boundsPagina[2] + margenInferior;
            var x2 = boundsPagina[3] - 10;
            var y2 = y1 + altoTexto;
            var contenido = "";
            for (var i = 0; i < LINEAS.length && i < CANTIDAD_LINEAS_MOSTRAR; i++) {
                if (i > 0) contenido += "\r";
                contenido += LINEAS[i];
            }
            AdaptadorInDesign.crearMarcoTexto(pagina, [y1, x1, y2, x2], contenido, LINEA_PUNTO);
        } catch (e) {}
    }

    function mostrarError(mensaje) {
        registrar("ERROR: " + mensaje);
        mostrar();
    }

    return {
        limpiar: limpiar,
        registrar: registrar,
        mostrar: mostrar,
        mostrarError: mostrarError,
        obtenerLineas: obtenerLineas
    };

})();
