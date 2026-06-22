var MaquetacionPorCategoria = (function() {

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

        Depuracion.registrar("  Clasificado como: " + categoria);

        if (categoria === CalculoDeMedidas.MEDIA_CARTA.nombre) {
            var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina);
            if (superposicion === "horizontal" || superposicion === "ambas") {
                alert("El elemento seleccionado está encima de la guía horizontal del centro de página.");
                return;
            }
            TrazadoDeGuias.trazarSoloHorizontal(pagina);
        } else if (categoria === CalculoDeMedidas.CUARTO_CARTA.nombre) {
            MaquetarDocumentoParaImpresion.procesarElemento(obj, pagina);
        }
    }

    function procesar(config) {
        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();

        if (seleccion.length > 1) {
            MaquetarDocumentoParaImpresion.procesar(config);
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
