var MaquetarDocumentoParaImpresion = (function() {

    function estaEnCuadranteSuperiorIzquierdo(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroX = (pBounds[1] + pBounds[3]) / 2;
        var centroY = (pBounds[0] + pBounds[2]) / 2;

        var bounds = obj.geometricBounds;

        return bounds[0] >= pBounds[0] &&
               bounds[1] >= pBounds[1] &&
               bounds[2] <= centroY &&
               bounds[3] <= centroX;
    }

    function duplicarSimetrico(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroX = (pBounds[1] + pBounds[3]) / 2;

        var bounds = obj.geometricBounds;
        var centroElementoX = (bounds[1] + bounds[3]) / 2;

        var dup = obj.duplicate();
        var deltaX = 2 * (centroX - centroElementoX);
        dup.move([deltaX, 0]);
        return dup;
    }

    function procesarElemento(obj, pagina) {
        TrazadoDeGuias.trazarAmbosEjes(pagina);

        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina);
        if (superposicion !== null) {
            alert("El elemento seleccionado está encima de la gu\u00EDa " + superposicion + " del centro de p\u00E1gina.");
            return false;
        }

        if (!estaEnCuadranteSuperiorIzquierdo(obj, pagina)) {
            alert("El elemento seleccionado debe estar contenido en el cuadrante superior izquierdo.");
            return false;
        }

        duplicarSimetrico(obj, pagina);
        Depuracion.registrar("Elemento duplicado simetricamente al cuadrante superior derecho.");
        return true;
    }

    function procesar(config) {
        if (!ValidacionDeEjecucion.validar()) {
            return false;
        }

        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();

        Depuracion.registrar("MaquetarDocumentoParaImpresion: procesando " + seleccion.length + " elemento(s)...");

        var exito = false;
        for (var i = 0; i < seleccion.length; i++) {
            try {
                if (procesarElemento(seleccion[i], pagina)) {
                    exito = true;
                }
            } catch (e) {
                Depuracion.registrar("  Error al procesar elemento " + (i + 1) + ": " + e.toString());
            }
        }

        return exito;
    }

    function ejecutar(config) {
        Depuracion.limpiar();
        Depuracion.registrar("--- Maquetar Documento Para Impresion ---");

        Unidades.ejecutarConUnidadesEnPuntos(function() {
            procesar(config);
        });

        Depuracion.registrar("--- Fin del proceso ---");
        Depuracion.mostrar();
    }

    return {
        ejecutar: ejecutar,
        procesar: procesar,
        procesarElemento: procesarElemento,
        estaEnCuadranteSuperiorIzquierdo: estaEnCuadranteSuperiorIzquierdo,
        duplicarSimetrico: duplicarSimetrico
    };

})();
