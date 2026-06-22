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
// MÓDULO: InDesign
// ====================================================================

var InDesign = (function() {

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

    function hayDocumentoAbierto() {
        return app.documents.length > 0;
    }

    function hayElementosSeleccionados() {
        return app.selection.length > 0;
    }

    function obtenerSeleccionActual() {
        return app.selection;
    }

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

    function medirElemento(obj) {
        var unidad = obtenerUnidadActual();
        var bounds = obj.geometricBounds;
        return {
            ancho: convertirAMilimetros(Math.abs(bounds[3] - bounds[1]), unidad),
            alto: convertirAMilimetros(Math.abs(bounds[2] - bounds[0]), unidad)
        };
    }

    function obtenerPaginaActiva() {
        return app.activeWindow.activePage;
    }

    function crearGuiaHorizontal(pagina, posicionY_mm) {
        try {
            var unidad = obtenerUnidadActual();
            var posY = convertirDeMilimetros(posicionY_mm, unidad);
            var guia = pagina.guides.add({location: posY});
            guia.orientation = HorizontalOrientation.horizontal;
            Depurador.registrar("   Guía horizontal creada en Y=" + posicionY_mm.toFixed(2) + "mm (unidad: " + unidad + ")");
            return guia;
        } catch (e) {
            Depurador.registrar("   ERROR al crear guía horizontal: " + e.toString());
            return null;
        }
    }

    function crearGuiaVertical(pagina, posicionX_mm) {
        try {
            var unidad = obtenerUnidadActual();
            var posX = convertirDeMilimetros(posicionX_mm, unidad);
            var guia = pagina.guides.add({location: posX});
            guia.orientation = HorizontalOrientation.vertical;
            Depurador.registrar("   Guía vertical creada en X=" + posicionX_mm.toFixed(2) + "mm (unidad: " + unidad + ")");
            return guia;
        } catch (e) {
            Depurador.registrar("   ERROR al crear guía vertical: " + e.toString());
            return null;
        }
    }

    return {
        hayDocumentoAbierto: hayDocumentoAbierto,
        hayElementosSeleccionados: hayElementosSeleccionados,
        obtenerSeleccionActual: obtenerSeleccionActual,
        medirElemento: medirElemento,
        obtenerPaginaActiva: obtenerPaginaActiva,
        crearGuiaHorizontal: crearGuiaHorizontal,
        crearGuiaVertical: crearGuiaVertical,
        obtenerUnidadActual: obtenerUnidadActual,
        convertirAMilimetros: convertirAMilimetros,
        convertirDeMilimetros: convertirDeMilimetros
    };

})();

// ====================================================================
// MÓDULO: Guiador
// ====================================================================

var Guiador = (function() {

    function calcularCentroPagina(pagina) {
        var unidad = InDesign.obtenerUnidadActual();
        var bounds = pagina.bounds;
        var medioX = (bounds[1] + bounds[3]) / 2;
        var medioY = (bounds[0] + bounds[2]) / 2;
        return {
            x: InDesign.convertirAMilimetros(medioX, unidad),
            y: InDesign.convertirAMilimetros(medioY, unidad)
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
            var boundsPagina = pagina.bounds;
            var anchoPagina = boundsPagina[3] - boundsPagina[1];
            var finPagina = boundsPagina[2];

            var marco = pagina.textFrames.add();
            marco.geometricBounds = [
                finPagina + 10,
                boundsPagina[1],
                finPagina + 10 + (textos.length * 4),
                boundsPagina[1] + anchoPagina
            ];
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

    if (!InDesign.hayDocumentoAbierto()) {
        Depurador.registrar("ERROR: No hay documento abierto.");
        Depurador.mostrar();
        return;
    }

    if (!InDesign.hayElementosSeleccionados()) {
        Depurador.registrar("ERROR: No hay elementos seleccionados.");
        Depurador.mostrar();
        return;
    }

    var seleccion = InDesign.obtenerSeleccionActual();
    var resultados = [];

    for (var i = 0; i < seleccion.length; i++) {
        var dim = InDesign.medirElemento(seleccion[i]);
        var categoria = Clasificador.clasificar(dim.ancho, dim.alto);

        Depurador.registrar("Elemento " + (i + 1) + ": " + dim.ancho.toFixed(2) + " x " + dim.alto.toFixed(2) + " mm -> " + categoria);

        if (categoria === "Cuarto Carta") {
            Depurador.registrar("-> Coincide con Cuarto Carta. Intentando crear guías...");
            var pagina = InDesign.obtenerPaginaActiva();
            if (pagina) {
                Depurador.registrar("-> Página activa obtenida");
                Guiador.trazarGuiasAlCentro(pagina);
                Depurador.registrar("-> Proceso de guías completado.");
            } else {
                Depurador.registrar("-> ERROR: No se pudo obtener la página activa.");
            }
        }

        resultados.push({
            indice: i + 1,
            categoria: categoria || "Sin categoría",
            ancho: dim.ancho,
            alto: dim.alto
        });
    }

    Presentador.volcarResultados(resultados);
    Depurador.mostrar();
}

// ====================================================================
// ENTRY POINT
// ====================================================================

ejecutar();
