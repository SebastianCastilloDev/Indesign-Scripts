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

    return {
        CARTA: CARTA,
        MEDIA_CARTA: MEDIA_CARTA,
        CUARTO_CARTA: CUARTO_CARTA,
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
        clasificar: function(ancho, alto, tolerancias) {
            var catalogo = Medidas.obtenerCatalogo();
            var tolH = (tolerancias && tolerancias.horizontal !== undefined) ? tolerancias.horizontal : 2;
            var tolV = (tolerancias && tolerancias.vertical !== undefined) ? tolerancias.vertical : 2;
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

    function convertirPuntosAMilimetros(valor) {
        return valor * FACTOR_A_MM[MeasurementUnits.points];
    }

    function ejecutarConUnidadesEnPuntos(accion) {
        var doc = app.activeDocument;
        var unidadHorizontal = doc.viewPreferences.horizontalMeasurementUnits;
        var unidadVertical = doc.viewPreferences.verticalMeasurementUnits;

        try {
            doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
            doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
            return accion();
        } finally {
            doc.viewPreferences.horizontalMeasurementUnits = unidadHorizontal;
            doc.viewPreferences.verticalMeasurementUnits = unidadVertical;
        }
    }

    return {
        obtenerUnidadActual: obtenerUnidadActual,
        convertirAMilimetros: convertirAMilimetros,
        convertirDeMilimetros: convertirDeMilimetros,
        convertirPuntosAMilimetros: convertirPuntosAMilimetros,
        ejecutarConUnidadesEnPuntos: ejecutarConUnidadesEnPuntos
    };

})();

// ====================================================================
// MÓDULO: InDesign
// ====================================================================

var InDesign = (function() {

    var HORIZONTAL = 1752134266;
    var VERTICAL = 1986224746;

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

    function crearGuiaHorizontal(pagina, posicionY) {
        var guia = pagina.guides.add();
        guia.orientation = HORIZONTAL;
        guia.location = posicionY;
        return guia;
    }

    function crearGuiaVertical(pagina, posicionX) {
        var guia = pagina.guides.add();
        guia.orientation = VERTICAL;
        guia.location = posicionX;
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

    function obtenerCentroPagina(pagina) {
        var bounds = pagina.bounds;
        var ancho = Math.abs(bounds[3] - bounds[1]);
        var alto = Math.abs(bounds[2] - bounds[0]);

        return {
            x: ancho / 2,
            y: alto / 2,
            absolutoX: bounds[1] + (ancho / 2),
            absolutoY: bounds[0] + (alto / 2),
            top: bounds[0],
            left: bounds[1]
        };
    }

    function registrarCentro(centro) {
        Depurador.registrar(
            "   Centro relativo página: X=" + Unidades.convertirPuntosAMilimetros(centro.x).toFixed(2) +
            "mm, Y=" + Unidades.convertirPuntosAMilimetros(centro.y).toFixed(2) + "mm"
        );
        Depurador.registrar(
            "   Centro absoluto regla: X=" + Unidades.convertirPuntosAMilimetros(centro.absolutoX).toFixed(2) +
            "mm, Y=" + Unidades.convertirPuntosAMilimetros(centro.absolutoY).toFixed(2) + "mm"
        );
    }

    function trazarGuiaHorizontalAlCentro(pagina) {
        Unidades.ejecutarConUnidadesEnPuntos(function() {
            try {
                var centro = obtenerCentroPagina(pagina);
                registrarCentro(centro);
                InDesign.crearGuiaHorizontal(pagina, centro.y);
                Depurador.registrar("   Guía horizontal creada al centro.");
            } catch (e) {
                Depurador.registrar("   ERROR guía horizontal: " + e.toString());
            }
        });
    }

    function trazarGuiaVerticalAlCentro(pagina) {
        Unidades.ejecutarConUnidadesEnPuntos(function() {
            try {
                var centro = obtenerCentroPagina(pagina);
                registrarCentro(centro);
                InDesign.crearGuiaVertical(pagina, centro.x);
                Depurador.registrar("   Guía vertical creada al centro.");
            } catch (e) {
                Depurador.registrar("   ERROR guía vertical: " + e.toString());
            }
        });
    }

    function trazarGuiasAlCentro(pagina) {
        trazarGuiaHorizontalAlCentro(pagina);
        trazarGuiaVerticalAlCentro(pagina);
    }

    return {
        trazarGuiaHorizontalAlCentro: trazarGuiaHorizontalAlCentro,
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
            Unidades.ejecutarConUnidadesEnPuntos(function() {
                var doc = app.activeDocument;
                var pagina = doc.pages[0];
                var boundsPagina = pagina.bounds;
                var altoMarco = Math.max(60, textos.length * 10);

                var marco = pagina.textFrames.add();
                marco.geometricBounds = [
                    boundsPagina[2] + 30,
                    boundsPagina[1],
                    boundsPagina[2] + 30 + altoMarco,
                    boundsPagina[3]
                ];
                marco.contents = textos.join("\n");
                marco.texts[0].pointSize = 7;
            });
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

    var Opciones = {
        tolerancias: { horizontal: 2, vertical: 2 }
    };

    function configurar(config) {
        if (config.tolerancias) {
            Opciones.tolerancias = config.tolerancias;
        }
    }

    function analizarElemento(obj) {
        var dim = InDesign.medirElemento(obj);
        var categoria = Clasificador.clasificar(dim.ancho, dim.alto, Opciones.tolerancias);
        Depurador.registrar("Elemento: " + dim.ancho.toFixed(2) + " x " + dim.alto.toFixed(2) + " mm -> " + categoria);
        return {
            categoria: categoria,
            ancho: dim.ancho,
            alto: dim.alto
        };
    }

    function aplicarAccionesSegunCategoria(resultado) {
        var pagina = InDesign.obtenerPaginaActiva();
        if (!pagina) {
            Depurador.registrar("-> ERROR: No se pudo obtener la página activa.");
            return;
        }

        if (resultado.categoria === "Cuarto Carta") {
            Depurador.registrar("-> Cuarto Carta: creando guías horizontal y vertical al centro...");
            Guiador.trazarGuiasAlCentro(pagina);
        } else if (resultado.categoria === "Media Carta") {
            Depurador.registrar("-> Media Carta: creando guía horizontal al centro...");
            Guiador.trazarGuiaHorizontalAlCentro(pagina);
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
        configurar: configurar,
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
// CONFIGURACIÓN
// ====================================================================

var CONFIG = {
    tolerancias: {
        horizontal: 2,
        vertical: 2
    }
};

// ====================================================================
// ORQUESTADOR
// ====================================================================

function ejecutar(config) {
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

    Procesador.configurar(config);
    var resultados = Procesador.procesarSeleccion();

    Presentador.volcarResultados(resultados);
    Depurador.mostrar();
}

// ====================================================================
// ENTRY POINT
// ====================================================================

ejecutar(CONFIG);
