var MaquetacionPorCategoria = (function() {

    var MANEJADORES = {};
    MANEJADORES[CatalogoDeFormatos.MEDIA_CARTA.nombre]   = MaquetarMediaCarta.procesarElemento;
    MANEJADORES[CatalogoDeFormatos.CUARTO_CARTA.nombre]  = MaquetarCuartoCarta.procesarElemento;

    function analizarElemento(obj, tolerancias) {
        var dimensiones = AdaptadorInDesign.medirElementoEnMilimetros(obj);
        var categoria = ClasificacionDeFormato.clasificar(dimensiones, tolerancias);

        Depuracion.registrar("  Medidas: " + dimensiones.ancho.toFixed(1) + " x " + dimensiones.alto.toFixed(1) + " mm  →  " + (categoria || "sin categoría"));

        var cat = CatalogoDeFormatos;
        Depuracion.registrar("  Catalogo — Media Carta: " + cat.MEDIA_CARTA.ancho.toFixed(1) + "x" + cat.MEDIA_CARTA.alto.toFixed(1) + "  Cuarto Carta: " + cat.CUARTO_CARTA.ancho.toFixed(1) + "x" + cat.CUARTO_CARTA.alto.toFixed(1) + " (tol ±" + tolerancias.horizontal + "mm)");

        return {
            dimensiones: dimensiones,
            categoria: categoria
        };
    }

    function aplicarAccionSegunCategoria(resultado, obj, pagina) {
        var categoria = resultado.categoria;

        if (categoria === null) {
            Depuracion.registrar("  Elemento sin categoría (" + Math.round(resultado.dimensiones.ancho) + "x" + Math.round(resultado.dimensiones.alto) + " mm)");
            return false;
        }

        var manejador = MANEJADORES[categoria];
        if (!manejador) {
            Depuracion.registrar("  Categoría sin manejador: " + categoria);
            return false;
        }

        Depuracion.registrar("  Clasificado como: " + categoria);
        return manejador(obj, pagina);
    }

    function convertirSeleccionEnArray(seleccion) {
        var arr = [];
        for (var i = 0; i < seleccion.length; i++) arr.push(seleccion[i]);
        return arr;
    }

    function procesar(config) {
        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();

        Depuracion.registrar("Seleccion: " + seleccion.length + " elemento(s)");

        if (seleccion.length === 0) return;

        if (seleccion.length === 1) {
            var obj = seleccion[0];
            Depuracion.registrar("Elemento: " + (obj.constructor.name || "desconocido"));
            try {
                var resultado = analizarElemento(obj, config.tolerancias);
                aplicarAccionSegunCategoria(resultado, obj, pagina);
            } catch (e) {
                Depuracion.registrar("  Error al procesar: " + e.toString());
            }
            return;
        }

        // Múltiples elementos: agrupar temporalmente para medir el bounding box
        // combinado y clasificar correctamente antes de despachar al handler.
        Depuracion.registrar("  Agrupando " + seleccion.length + " elementos para clasificar...");
        var grupo = AdaptadorInDesign.agruparElementos(convertirSeleccionEnArray(seleccion));

        try {
            var resultado = analizarElemento(grupo, config.tolerancias);
            var exito = aplicarAccionSegunCategoria(resultado, grupo, pagina);

            if (!exito) {
                Depuracion.registrar("  Procesamiento no exitoso. Desagrupando para restaurar la selección original.");
                try { AdaptadorInDesign.desagruparElemento(grupo); } catch (e2) {}
            }
        } catch (e) {
            Depuracion.registrar("  Error al procesar grupo: " + e.toString());
            try { AdaptadorInDesign.desagruparElemento(grupo); } catch (e2) {}
        }
    }

    return {
        procesar: procesar
    };

})();
