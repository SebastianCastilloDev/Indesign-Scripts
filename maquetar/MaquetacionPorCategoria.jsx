var MaquetacionPorCategoria = (function() {

    function analizarElemento(obj, tolerancias) {
        var dimensiones = AdaptadorInDesign.medirElementoEnMilimetros(obj);
        var categoria = ClasificacionDeFormato.clasificar(dimensiones, tolerancias);

        return {
            dimensiones: dimensiones,
            categoria: categoria
        };
    }

    function validarSuperposicionObjetoConLineaGuia(obj, pagina) {
        var bounds = AdaptadorInDesign.obtenerBounds(obj);
        var pBounds = pagina.bounds;

        var centroY = (pBounds[0] + pBounds[2]) / 2;
        var centroX = (pBounds[1] + pBounds[3]) / 2;

        var top = bounds[0];
        var bottom = bounds[2];
        var left = bounds[1];
        var right = bounds[3];

        var sobreHorizontal = (top <= centroY && bottom >= centroY);
        var sobreVertical = (left <= centroX && right >= centroX);

        if (sobreHorizontal && sobreVertical) return "ambas";
        if (sobreHorizontal) return "horizontal";
        if (sobreVertical) return "vertical";
        return null;
    }

    function aplicarAccionSegunCategoria(resultado, obj, pagina) {
        var categoria = resultado.categoria;

        if (categoria === null) {
            Depuracion.registrar("  Elemento sin categoría (" + Math.round(resultado.dimensiones.ancho) + "x" + Math.round(resultado.dimensiones.alto) + " mm)");
            return;
        }

        Depuracion.registrar("  Clasificado como: " + categoria);

        if (categoria === CalculoDeMedidas.MEDIA_CARTA.nombre) {
            var superposicion = validarSuperposicionObjetoConLineaGuia(obj, pagina);
            if (superposicion === "horizontal" || superposicion === "ambas") {
                alert("El elemento seleccionado está encima de la guía horizontal del centro de página.");
                return;
            }
            TrazadoDeGuias.trazarSoloHorizontal(pagina);
        } else if (categoria === CalculoDeMedidas.CUARTO_CARTA.nombre) {
            var superposicion = validarSuperposicionObjetoConLineaGuia(obj, pagina);
            if (superposicion !== null) {
                alert("El elemento seleccionado está encima de la gu\u00EDa " + superposicion + " del centro de p\u00E1gina.");
                return;
            }
            TrazadoDeGuias.trazarAmbosEjes(pagina);
        }
    }

    function procesar(config) {
        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();

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
