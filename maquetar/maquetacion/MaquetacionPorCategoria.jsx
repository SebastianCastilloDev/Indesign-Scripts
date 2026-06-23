var MaquetacionPorCategoria = (function() {

    var MANEJADORES = {};
    MANEJADORES[Papeles.VARIANTE.COMPLETO] = MaquetarCompleto.procesarElemento;
    MANEJADORES[Papeles.VARIANTE.MEDIA]    = MaquetarMedia.procesarElemento;
    MANEJADORES[Papeles.VARIANTE.CUARTO]   = MaquetarCuarto.procesarElemento;

    function analizarElemento(obj, papel, tolerancias) {
        var dimensiones = AdaptadorInDesign.medirElementoEnMilimetros(obj);
        var variante = ClasificacionDeFormato.clasificar(dimensiones, tolerancias, papel.obtenerCatalogo());

        Depuracion.registrar("  Medidas: " + dimensiones.ancho.toFixed(1) + " x " + dimensiones.alto.toFixed(1) + " mm  →  " + (variante || "sin variante"));
        Depuracion.registrarDetalle("  Papel " + papel.nombre + " — eje plegado " + papel.ejeHorizontalMm + "mm, verificación [" + papel.verificacionMm.join(",") + "] (tol ±" + tolerancias.horizontal + "mm)");

        return {
            dimensiones: dimensiones,
            variante: variante
        };
    }

    function aplicarAccionSegunVariante(resultado, obj, pagina, papel) {
        var variante = resultado.variante;

        if (variante === null) {
            Depuracion.registrar("  Sin variante (" + Math.round(resultado.dimensiones.ancho) + "x" + Math.round(resultado.dimensiones.alto) + " mm)");
            return null;
        }

        var manejador = MANEJADORES[variante];
        if (!manejador) {
            Depuracion.registrar("  Variante sin manejador: " + variante);
            return null;
        }

        Depuracion.registrar("  Variante: " + variante);
        return manejador(obj, pagina, papel);
    }

    function convertirSeleccionEnArray(seleccion) {
        var arr = [];
        for (var i = 0; i < seleccion.length; i++) arr.push(seleccion[i]);
        return arr;
    }

    function estaFueraDePagina(obj, pagina) {
        return Bounds.estaFueraDePagina(Bounds.deObjeto(obj), Bounds.dePagina(pagina));
    }

    function desagruparSeguro(obj) {
        try {
            AdaptadorInDesign.desagruparElemento(obj);
        } catch (e) {
            Depuracion.registrar("  No se pudo desagrupar: " + e.toString());
        }
    }

    function procesar(config, papel) {
        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();

        Depuracion.registrar("Papel: " + papel.nombre + " | Selección: " + seleccion.length + " elemento(s)");

        if (seleccion.length === 0) return;

        if (seleccion.length === 1) {
            var obj = seleccion[0];
            Depuracion.registrar("Elemento: " + (obj.constructor.name || "desconocido"));

            if (estaFueraDePagina(obj, pagina)) {
                Depuracion.registrar("  Elemento fuera de la página.");
                alert("La selección está fuera de la página.\nMuévela dentro de la página antes de ejecutar el script.");
                return;
            }

            try {
                var resultado = analizarElemento(obj, papel, config.tolerancias);
                aplicarAccionSegunVariante(resultado, obj, pagina, papel);
            } catch (e) {
                Depuracion.registrar("  Error al procesar: " + e.toString());
            }
            return;
        }

        // Múltiples elementos: agrupar temporalmente para medir el bounding box
        // combinado y clasificar la variante antes de despachar al handler.
        Depuracion.registrar("  Agrupando " + seleccion.length + " elementos para clasificar...");
        var grupo = AdaptadorInDesign.agruparElementos(convertirSeleccionEnArray(seleccion));

        try {
            if (estaFueraDePagina(grupo, pagina)) {
                Depuracion.registrar("  Selección fuera de la página. Desagrupando.");
                alert("La selección está fuera de la página.\nMuévela dentro de la página antes de ejecutar el script.");
                desagruparSeguro(grupo);
                return;
            }

            var resultado = analizarElemento(grupo, papel, config.tolerancias);
            var copias = aplicarAccionSegunVariante(resultado, grupo, pagina, papel);

            if (!copias) {
                Depuracion.registrar("  Procesamiento no exitoso. Desagrupando para restaurar la selección original.");
                desagruparSeguro(grupo);
                return;
            }

            // Desagrupar el grupo original y todas las copias para que quede
            // todo suelto, igual que antes de ejecutar el script.
            Depuracion.registrar("  Desagrupando grupos temporales para optimizar rendimiento de impresión...");
            desagruparSeguro(grupo);
            for (var i = 0; i < copias.length; i++) {
                desagruparSeguro(copias[i]);
            }
        } catch (e) {
            Depuracion.registrar("  Error al procesar grupo: " + e.toString());
            desagruparSeguro(grupo);
        }
    }

    return {
        procesar: procesar
    };

})();
