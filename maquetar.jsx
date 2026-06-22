// ====================================================================
// MÓDULO: Medidas
// ====================================================================

var Medidas = (function() {

    var CARTA = {
        nombre: "Carta",
        ancho: 215.9,
        alto: 279.4
    };

    function calcularMediaCarta() {
        return {
            nombre: "Media Carta",
            ancho: CARTA.alto / 2,
            alto: CARTA.ancho
        };
    }

    function calcularCuartoCarta() {
        return {
            nombre: "Cuarto Carta",
            ancho: CARTA.ancho / 2,
            alto: CARTA.alto / 2
        };
    }

    var MEDIA_CARTA = calcularMediaCarta();
    var CUARTO_CARTA = calcularCuartoCarta();

    var toleranciaHorizontal = 2;
    var toleranciaVertical = 2;

    return {
        CARTA: CARTA,
        MEDIA_CARTA: MEDIA_CARTA,
        CUARTO_CARTA: CUARTO_CARTA,
        toleranciaHorizontal: toleranciaHorizontal,
        toleranciaVertical: toleranciaVertical,
        obtenerCatalogo: function() {
            return [CARTA, MEDIA_CARTA, CUARTO_CARTA];
        }
    };

})();

// ====================================================================
// MÓDULO: Clasificador
// ====================================================================

var Clasificador = (function() {

    function calcularArea(ancho, alto) {
        return ancho * alto;
    }

    function cabeEnDimension(ancho, alto, refAncho, refAlto, tolH, tolV) {
        return (ancho <= refAncho + tolH && alto <= refAlto + tolV);
    }

    function determinarTamanio(ancho, alto, catalogo, tolH, tolV) {
        var mejor = null;
        var menorArea = Infinity;

        for (var i = 0; i < catalogo.length; i++) {
            var t = catalogo[i];
            var areaRef = calcularArea(t.ancho, t.alto);

            var entraDirecto = cabeEnDimension(ancho, alto, t.ancho, t.alto, tolH, tolV);
            var entraRotado = cabeEnDimension(ancho, alto, t.alto, t.ancho, tolH, tolV);

            if (entraDirecto || entraRotado) {
                if (areaRef < menorArea) {
                    menorArea = areaRef;
                    mejor = t.nombre;
                }
            }
        }
        return mejor;
    }

    return {
        clasificar: function(ancho, alto) {
            var catalogo = Medidas.obtenerCatalogo();
            var tolH = Medidas.toleranciaHorizontal;
            var tolV = Medidas.toleranciaVertical;
            return determinarTamanio(ancho, alto, catalogo, tolH, tolV);
        }
    };

})();

// ====================================================================
// MÓDULO: Unidades
// ====================================================================

var Unidades = (function() {

    var FACTOR_A_MM = {};
    FACTOR_A_MM[MeasurementUnits.millimeters] = 1;
    FACTOR_A_MM[MeasurementUnits.centimeters] = 10;
    FACTOR_A_MM[MeasurementUnits.inches]      = 25.4;
    FACTOR_A_MM[MeasurementUnits.picas]       = 4.23333333333;
    FACTOR_A_MM[MeasurementUnits.points]      = 0.35277777778;
    FACTOR_A_MM[MeasurementUnits.agates]      = 0.18142857142;

    var FACTOR_DE_MM = {};
    FACTOR_DE_MM[MeasurementUnits.millimeters] = 1;
    FACTOR_DE_MM[MeasurementUnits.centimeters] = 0.1;
    FACTOR_DE_MM[MeasurementUnits.inches]      = 0.03937007874;
    FACTOR_DE_MM[MeasurementUnits.picas]       = 0.23622047244;
    FACTOR_DE_MM[MeasurementUnits.points]      = 2.83464566929;
    FACTOR_DE_MM[MeasurementUnits.agates]      = 5.51181102362;

    function obtenerUnidadActual() {
        return app.activeDocument.viewPreferences.horizontalMeasurementUnits;
    }

    function convertirAMilimetros(valor, unidad) {
        var factor = FACTOR_A_MM[unidad];
        if (factor === undefined) return valor;
        return valor * factor;
    }

    function convertirDeMilimetros(valor, unidad) {
        var factor = FACTOR_DE_MM[unidad];
        if (factor === undefined) return valor;
        return valor * factor;
    }

    return {
        obtenerUnidadActual: obtenerUnidadActual,
        convertirAMilimetros: convertirAMilimetros,
        convertirDeMilimetros: convertirDeMilimetros
    };

})();

// ====================================================================
// MÓDULO: InDesign
// ====================================================================

var InDesign = (function() {

    function hayDocumentoAbierto() {
        return app.documents.length > 0;
    }

    function hayElementosSeleccionados() {
        return app.selection.length > 0;
    }

    function obtenerSeleccionActual() {
        return app.selection;
    }

    function medirElemento(obj) {
        var unidad = Unidades.obtenerUnidadActual();
        var bounds = obj.geometricBounds;
        return {
            ancho: Unidades.convertirAMilimetros(Math.abs(bounds[3] - bounds[1]), unidad),
            alto: Unidades.convertirAMilimetros(Math.abs(bounds[2] - bounds[0]), unidad)
        };
    }

    function obtenerPaginaActiva() {
        return app.activeWindow.activePage;
    }

    function crearGuiaHorizontal(pagina, posicionY_mm) {
        var unidad = Unidades.obtenerUnidadActual();
        var posY = Unidades.convertirDeMilimetros(posicionY_mm, unidad);
        var guia = pagina.guides.add({location: posY});
        guia.orientation = HorizontalOrientation.horizontal;
        return guia;
    }

    function crearGuiaVertical(pagina, posicionX_mm) {
        var unidad = Unidades.obtenerUnidadActual();
        var posX = Unidades.convertirDeMilimetros(posicionX_mm, unidad);
        var guia = pagina.guides.add({location: posX});
        guia.orientation = HorizontalOrientation.vertical;
        return guia;
    }

    return {
        hayDocumentoAbierto: hayDocumentoAbierto,
        hayElementosSeleccionados: hayElementosSeleccionados,
        obtenerSeleccionActual: obtenerSeleccionActual,
        medirElemento: medirElemento,
        obtenerPaginaActiva: obtenerPaginaActiva,
        crearGuiaHorizontal: crearGuiaHorizontal,
        crearGuiaVertical: crearGuiaVertical
    };

})();

// ====================================================================
// MÓDULO: Guiador
// ====================================================================

var Guiador = (function() {

    function calcularCentroPagina(pagina) {
        var unidad = Unidades.obtenerUnidadActual();
        var bounds = pagina.bounds;
        var medioX = (bounds[1] + bounds[3]) / 2;
        var medioY = (bounds[0] + bounds[2]) / 2;
        return {
            x: Unidades.convertirAMilimetros(medioX, unidad),
            y: Unidades.convertirAMilimetros(medioY, unidad)
        };
    }

    function trazarGuiaHorizontalAlCentro(pagina) {
        var centro = calcularCentroPagina(pagina);
        InDesign.crearGuiaHorizontal(pagina, centro.y);
    }

    function trazarGuiaVerticalAlCentro(pagina) {
        var centro = calcularCentroPagina(pagina);
        InDesign.crearGuiaVertical(pagina, centro.x);
    }

    function trazarGuiasAlCentro(pagina) {
        trazarGuiaHorizontalAlCentro(pagina);
        trazarGuiaVerticalAlCentro(pagina);
    }

    return {
        trazarGuiasAlCentro: trazarGuiasAlCentro
    };

})();

// ====================================================================
// MÓDULO: Depurador
// ====================================================================

var Depurador = (function() {

    var textos = [];
    var ACTIVO = true;

    function registrar(mensaje) {
        if (!ACTIVO) return;
        textos.push(mensaje);
    }

    function mostrar() {
        if (!ACTIVO || textos.length === 0) return;
        try {
            var doc = app.activeDocument;
            var pagina = doc.pages[0];
            var unidad = Unidades.obtenerUnidadActual();

            var boundsPagina_mm = pagina.bounds;
            var top = Unidades.convertirDeMilimetros(boundsPagina_mm[2] + 10, unidad);
            var left = Unidades.convertirDeMilimetros(boundsPagina_mm[1], unidad);
            var bottom = Unidades.convertirDeMilimetros(boundsPagina_mm[2] + 10 + (textos.length * 4), unidad);
            var right = Unidades.convertirDeMilimetros(boundsPagina_mm[3], unidad);

            var marco = pagina.textFrames.add();
            marco.geometricBounds = [top, left, bottom, right];
            marco.contents = textos.join("\n");
            marco.texts[0].pointSize = 7;
        } catch (e) {}
    }

    function limpiar() {
        textos = [];
    }

    function desactivar() {
        ACTIVO = false;
    }

    return {
        registrar: registrar,
        mostrar: mostrar,
        limpiar: limpiar,
        desactivar: desactivar
    };

})();

// ====================================================================
// MÓDULO: Validador
// ====================================================================

var Validador = (function() {

    function validarDocumento() {
        return InDesign.hayDocumentoAbierto();
    }

    function validarSeleccion() {
        return InDesign.hayElementosSeleccionados();
    }

    return {
        validarDocumento: validarDocumento,
        validarSeleccion: validarSeleccion
    };

})();

// ====================================================================
// MÓDULO: Procesador
// ====================================================================

var Procesador = (function() {

    function analizarElemento(obj) {
        var dim = InDesign.medirElemento(obj);
        var categoria = Clasificador.clasificar(dim.ancho, dim.alto);
        Depurador.registrar("Elemento: " + dim.ancho.toFixed(2) + " x " + dim.alto.toFixed(2) + " mm -> " + categoria);
        return {
            categoria: categoria,
            ancho: dim.ancho,
            alto: dim.alto
        };
    }

    function aplicarAccionesSegunCategoria(resultado) {
        if (resultado.categoria === "Cuarto Carta") {
            Depurador.registrar("-> Categoría Cuarto Carta: creando guías al centro...");
            var pagina = InDesign.obtenerPaginaActiva();
            if (pagina) {
                Guiador.trazarGuiasAlCentro(pagina);
            } else {
                Depurador.registrar("-> ERROR: No se pudo obtener la página activa.");
            }
        }
    }

    function procesarSeleccion() {
        var seleccion = InDesign.obtenerSeleccionActual();
        var resultados = [];

        for (var i = 0; i < seleccion.length; i++) {
            var resultado = analizarElemento(seleccion[i]);
            aplicarAccionesSegunCategoria(resultado);
            resultados.push({
                indice: i + 1,
                categoria: resultado.categoria || "Sin categoría",
                ancho: resultado.ancho,
                alto: resultado.alto
            });
        }

        return resultados;
    }

    return {
        procesarSeleccion: procesarSeleccion
    };

})();

// ====================================================================
// MÓDULO: Presentador
// ====================================================================

var Presentador = (function() {

    function volcarResultados(resultados) {
        Depurador.registrar("=== RESULTADOS ===");
        for (var i = 0; i < resultados.length; i++) {
            var r = resultados[i];
            Depurador.registrar("Elemento " + r.indice + ": " + r.categoria + " (" + r.ancho.toFixed(2) + " x " + r.alto.toFixed(2) + ")");
        }
    }

    return {
        volcarResultados: volcarResultados
    };

})();

// ====================================================================
// ORQUESTADOR
// ====================================================================

function ejecutar() {
    Depurador.limpiar();
    Depurador.registrar("=== INICIO DEPURACIÓN ===");

    if (!Validador.validarDocumento()) {
        Depurador.registrar("ERROR: No hay documento abierto.");
        Depurador.mostrar();
        return;
    }

    if (!Validador.validarSeleccion()) {
        Depurador.registrar("ERROR: No hay elementos seleccionados.");
        Depurador.mostrar();
        return;
    }

    var resultados = Procesador.procesarSeleccion();

    Presentador.volcarResultados(resultados);
    Depurador.mostrar();
}

// ====================================================================
// ENTRY POINT
// ====================================================================

ejecutar();
