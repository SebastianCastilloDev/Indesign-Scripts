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

    function convertirSeleccionEnArray(seleccion) {
        var elementos = [];
        for (var i = 0; i < seleccion.length; i++) {
            elementos.push(seleccion[i]);
        }
        return elementos;
    }

    function prepararObjetoBase(seleccion) {
        if (seleccion.length === 1) {
            return {
                obj: seleccion[0],
                agrupadoTemporal: false
            };
        }

        Depuracion.registrar("Agrupando " + seleccion.length + " elementos para maquetar como una sola pieza.");
        return {
            obj: AdaptadorInDesign.agruparElementos(convertirSeleccionEnArray(seleccion)),
            agrupadoTemporal: true
        };
    }

    function desagruparSiCorresponde(resultadoPreparacion, repeticiones) {
        if (!resultadoPreparacion.agrupadoTemporal) {
            return;
        }

        Depuracion.registrar("Desagrupando grupos temporales para optimizar el documento final.");
        desagruparElementoSeguro("inferior derecho", repeticiones.inferiorDerecho);
        desagruparElementoSeguro("inferior izquierdo", repeticiones.inferiorIzquierdo);
        desagruparElementoSeguro("superior derecho", repeticiones.superiorDerecho);
        desagruparElementoSeguro("original", resultadoPreparacion.obj);
    }

    function desagruparElementoSeguro(etiqueta, obj) {
        try {
            AdaptadorInDesign.desagruparElemento(obj);
            Depuracion.registrar("  Grupo temporal desagrupado: " + etiqueta);
        } catch (e) {
            Depuracion.registrar("  No se pudo desagrupar " + etiqueta + ": " + e.toString());
        }
    }

    function validarObjetoBase(obj, pagina) {
        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina);
        if (superposicion !== null) {
            alert("El elemento seleccionado está encima de la guía " + superposicion + " del centro de página.");
            return false;
        }

        if (!estaEnCuadranteSuperiorIzquierdo(obj, pagina)) {
            alert("El elemento seleccionado debe estar contenido en el cuadrante superior izquierdo.");
            return false;
        }

        return true;
    }

    function procesarElemento(resultadoPreparacion, pagina) {
        var obj = resultadoPreparacion.obj;

        TrazadoDeGuias.trazarAmbosEjes(pagina);

        if (!validarObjetoBase(obj, pagina)) {
            return false;
        }

        var repeticiones = RepeticionDeCuadrantes.duplicarEnCuadrantes(obj, pagina);
        desagruparSiCorresponde(resultadoPreparacion, repeticiones);
        Depuracion.registrar("Elemento duplicado: superior derecho sin rotar; cuadrantes inferiores con rotación de 180 grados.");
        return true;
    }

    function procesar(config) {
        if (!ValidacionDeEjecucion.validar()) {
            return false;
        }

        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();
        var resultadoPreparacion = prepararObjetoBase(seleccion);

        Depuracion.registrar("MaquetarDocumentoParaImpresion: procesando selección como una sola pieza...");

        try {
            return procesarElemento(resultadoPreparacion, pagina);
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
        prepararObjetoBase: prepararObjetoBase,
        desagruparSiCorresponde: desagruparSiCorresponde,
        desagruparElementoSeguro: desagruparElementoSeguro,
        validarObjetoBase: validarObjetoBase,
        estaEnCuadranteSuperiorIzquierdo: estaEnCuadranteSuperiorIzquierdo
    };

})();
