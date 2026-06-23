var MaquetarCuartoCarta = (function() {

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
            return "El elemento seleccionado está encima de la guía " + superposicion + " del centro de página.";
        }

        if (!Bounds.estaEnCuadranteSuperiorIzquierdo(Bounds.deObjeto(obj), Bounds.dePagina(pagina))) {
            return "El elemento seleccionado debe estar contenido en el cuadrante superior izquierdo.";
        }

        return null;
    }

    function procesarElemento(obj, pagina) {
        TrazadoDeGuias.trazarAmbosEjes(pagina);

        var error = validarObjetoBase(obj, pagina);
        if (error !== null) {
            alert(error);
            return null;
        }

        var rep = RepeticionDeCuadrantes.duplicarEnCuadrantes(obj, pagina);
        Depuracion.registrar("Elemento duplicado: superior derecho sin rotar; cuadrantes inferiores con rotación de 180 grados.");
        return [rep.superiorDerecho, rep.inferiorIzquierdo, rep.inferiorDerecho];
    }

    function procesar(config) {
        if (!ValidacionDeEjecucion.validar()) {
            return false;
        }

        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();
        var preparacion = prepararObjetoBase(seleccion);

        Depuracion.registrar("MaquetarCuartoCarta: procesando selección como una sola pieza...");

        TrazadoDeGuias.trazarAmbosEjes(pagina);

        try {
            var error = validarObjetoBase(preparacion.obj, pagina);
            if (error !== null) {
                alert(error);
                return false;
            }
            var repeticiones = RepeticionDeCuadrantes.duplicarEnCuadrantes(preparacion.obj, pagina);
            desagruparSiCorresponde(preparacion, repeticiones);
            Depuracion.registrar("Elemento duplicado: superior derecho sin rotar; cuadrantes inferiores con rotación de 180 grados.");
            return true;
        } catch (e) {
            Depuracion.registrar("  Error al procesar selección: " + e.toString());
        }

        return false;
    }

    function ejecutar(config) {
        Depuracion.limpiar();
        Depuracion.registrar("--- Maquetar Cuarto Carta ---");

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
        validarObjetoBase: validarObjetoBase
    };

})();
