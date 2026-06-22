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

    function obtenerNombreObjeto(obj) {
        try {
            return obj.constructor && obj.constructor.name ? obj.constructor.name : "desconocido";
        } catch (e) {
            return "desconocido";
        }
    }

    function registrarBounds(etiqueta, obj) {
        try {
            var bounds = obj.geometricBounds;
            Depuracion.registrar("    " + etiqueta + " tipo: " + obtenerNombreObjeto(obj));
            Depuracion.registrar("    " + etiqueta + " bounds: [" + bounds.join(", ") + "]");
            Depuracion.registrar("    " + etiqueta + " centro: [" + ((bounds[1] + bounds[3]) / 2) + ", " + ((bounds[0] + bounds[2]) / 2) + "]");
            Depuracion.registrar("    " + etiqueta + " ancho/alto: " + Math.abs(bounds[3] - bounds[1]) + " x " + Math.abs(bounds[2] - bounds[0]));
        } catch (e) {
            Depuracion.registrar("    " + etiqueta + " bounds no disponibles: " + e.toString());
        }
    }

    function registrarElementosInternos(etiqueta, obj) {
        try {
            var elementos = obj.allPageItems || obj.pageItems;
            if (!elementos) return;

            Depuracion.registrar("    " + etiqueta + " elementos internos: " + elementos.length);
            for (var i = 0; i < elementos.length && i < 30; i++) {
                var item = elementos[i];
                var bounds = item.geometricBounds;
                Depuracion.registrar("      [" + i + "] " + obtenerNombreObjeto(item) + " bounds: [" + bounds.join(", ") + "] rotation: " + item.rotationAngle);
            }
        } catch (e) {
            Depuracion.registrar("    " + etiqueta + " elementos internos no disponibles: " + e.toString());
        }
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

    function rotarMediaVuelta(obj) {
        var anguloActual = typeof obj.rotationAngle === "number" ? obj.rotationAngle : 0;
        Depuracion.registrar("  DEBUG rotarMediaVuelta:");
        Depuracion.registrar("    angulo antes: " + anguloActual);
        registrarBounds("antes de rotar", obj);
        obj.rotationAngle = anguloActual + 180;
        Depuracion.registrar("    angulo despues: " + obj.rotationAngle);
        registrarBounds("despues de rotar", obj);
        registrarElementosInternos("despues de rotar", obj);
        return obj;
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
        Depuracion.registrar("  DEBUG objeto base antes de duplicar:");
        registrarBounds("base", obj);
        registrarElementosInternos("base", obj);

        var dupHorizontal = duplicarHorizontal(obj, pagina);
        var dupVertical = duplicarVertical(obj, pagina);
        var dupDiagonal = duplicarVertical(dupHorizontal, pagina);

        rotarMediaVuelta(dupHorizontal);
        rotarMediaVuelta(dupVertical);
        rotarMediaVuelta(dupDiagonal);
    }

    function convertirSeleccionEnArray(seleccion) {
        var elementos = [];
        for (var i = 0; i < seleccion.length; i++) {
            elementos.push(seleccion[i]);
        }
        return elementos;
    }

    function prepararObjetoBase(seleccion, pagina) {
        if (seleccion.length === 1) {
            return seleccion[0];
        }

        Depuracion.registrar("Agrupando " + seleccion.length + " elementos para maquetar como una sola pieza.");
        return AdaptadorInDesign.agruparElementos(convertirSeleccionEnArray(seleccion));
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
        Depuracion.registrar("Elemento duplicado a los cuadrantes restantes con rotación de 180 grados.");
        return true;
    }

    function procesar(config) {
        if (!ValidacionDeEjecucion.validar()) {
            return false;
        }

        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();
        var obj = prepararObjetoBase(seleccion, pagina);

        Depuracion.registrar("MaquetarDocumentoParaImpresion: procesando selección como una sola pieza...");

        try {
            return procesarElemento(obj, pagina);
        } catch (e) {
            Depuracion.registrar("  Error al procesar selección: " + e.toString());
        }

        return false;
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
        duplicarEnCuadrantes: duplicarEnCuadrantes,
        prepararObjetoBase: prepararObjetoBase
    };

})();
