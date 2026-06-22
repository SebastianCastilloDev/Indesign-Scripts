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

    function duplicarHorizontal(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroX = (pBounds[1] + pBounds[3]) / 2;

        var bounds = obj.geometricBounds;
        var nuevoLeft = 2 * centroX - bounds[3];
        var deltaX = nuevoLeft - bounds[1];

        Depuracion.registrar("  DEBUG duplicarHorizontal:");
        Depuracion.registrar("    page bounds: [" + pBounds.join(", ") + "]");
        Depuracion.registrar("    centroX: " + centroX);
        Depuracion.registrar("    obj bounds: [" + bounds.join(", ") + "]");
        Depuracion.registrar("    nuevoLeft: " + nuevoLeft);
        Depuracion.registrar("    deltaX: " + deltaX);

        var dup = obj.duplicate();
        dup.move(undefined, [deltaX, 0]);

        var dupBounds = dup.geometricBounds;
        Depuracion.registrar("    dup bounds despues de mover: [" + dupBounds.join(", ") + "]");
        Depuracion.registrar("    nuevo centroElementoX: " + ((dupBounds[1] + dupBounds[3]) / 2));

        return dup;
    }

    function duplicarVertical(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroY = (pBounds[0] + pBounds[2]) / 2;

        var bounds = obj.geometricBounds;
        var nuevoTop = 2 * centroY - bounds[2];
        var deltaY = nuevoTop - bounds[0];

        Depuracion.registrar("  DEBUG duplicarVertical:");
        Depuracion.registrar("    page bounds: [" + pBounds.join(", ") + "]");
        Depuracion.registrar("    centroY: " + centroY);
        Depuracion.registrar("    obj bounds: [" + bounds.join(", ") + "]");
        Depuracion.registrar("    nuevoTop: " + nuevoTop);
        Depuracion.registrar("    deltaY: " + deltaY);

        var dup = obj.duplicate();
        dup.move(undefined, [0, deltaY]);

        var dupBounds = dup.geometricBounds;
        Depuracion.registrar("    dup bounds despues de mover: [" + dupBounds.join(", ") + "]");
        Depuracion.registrar("    nuevo centroElementoY: " + ((dupBounds[0] + dupBounds[2]) / 2));

        return dup;
    }

    function duplicarEnCuadrantes(obj, pagina) {
        var dupHorizontal = duplicarHorizontal(obj, pagina);
        duplicarVertical(obj, pagina);
        duplicarVertical(dupHorizontal, pagina);
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

        duplicarEnCuadrantes(obj, pagina);
        Depuracion.registrar("Elemento duplicado a los cuadrantes restantes sin invertir contenido.");
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
        duplicarHorizontal: duplicarHorizontal,
        duplicarVertical: duplicarVertical,
        duplicarEnCuadrantes: duplicarEnCuadrantes
    };

})();
