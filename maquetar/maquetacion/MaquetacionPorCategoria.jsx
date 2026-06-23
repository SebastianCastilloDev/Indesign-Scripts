var MaquetacionPorCategoria = (function() {

    var MANEJADORES = {};
    MANEJADORES[CatalogoDeFormatos.MEDIA_CARTA.nombre]   = MaquetarMediaCarta.procesarElemento;
    MANEJADORES[CatalogoDeFormatos.CUARTO_CARTA.nombre]  = MaquetarCuartoCarta.procesarElemento;

    function analizarElemento(obj, tolerancias) {
        var dimensiones = AdaptadorInDesign.medirElementoEnMilimetros(obj);
        var categoria = ClasificacionDeFormato.clasificar(dimensiones, tolerancias);

        return {
            dimensiones: dimensiones,
            categoria: categoria
        };
    }

    function aplicarAccionSegunCategoria(resultado, obj, pagina) {
        var categoria = resultado.categoria;

        if (categoria === null) {
            Depuracion.registrar("  Elemento sin categoría (" + Math.round(resultado.dimensiones.ancho) + "x" + Math.round(resultado.dimensiones.alto) + " mm)");
            return;
        }

        var manejador = MANEJADORES[categoria];
        if (!manejador) {
            Depuracion.registrar("  Categoría sin manejador: " + categoria);
            return;
        }

        Depuracion.registrar("  Clasificado como: " + categoria);
        manejador(obj, pagina);
    }

    function procesar(config) {
        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();

        if (seleccion.length > 1) {
            MaquetarCuartoCarta.procesar(config);
            return;
        }

        Depuracion.registrar("Procesando " + seleccion.length + " elemento(s)...");

        for (var i = 0; i < seleccion.length; i++) {
            var obj = seleccion[i];
            Depuracion.registrar("Elemento " + (i + 1) + ": " + (obj.constructor.name || "desconocido"));

            try {
                var resultado = analizarElemento(obj, config.tolerancias);
                aplicarAccionSegunCategoria(resultado, obj, pagina);
            } catch (e) {
                Depuracion.registrar("  Error al procesar: " + e.toString());
            }
        }
    }

    return {
        procesar: procesar
    };

})();
