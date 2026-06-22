// ====================================================================
// CONFIGURACION
// ====================================================================

var CONFIG = {
    tolerancias: {
        horizontal: 2,
        vertical: 2
    }
};

// ====================================================================
// BOUNDED CONTEXT: Calculo de medidas
// ====================================================================

var CalculoDeMedidas = (function() {

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

    function obtenerCatalogo() {
        return [CARTA, MEDIA_CARTA, CUARTO_CARTA];
    }

    return {
        CARTA: CARTA,
        MEDIA_CARTA: MEDIA_CARTA,
        CUARTO_CARTA: CUARTO_CARTA,
        obtenerCatalogo: obtenerCatalogo
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Clasificacion de formato
// ====================================================================

var ClasificacionDeFormato = (function() {

    function calcularArea(tamano) {
        return tamano.ancho * tamano.alto;
    }

    function cabeDirecto(dimensiones, tamano, tolerancias) {
        return dimensiones.ancho <= tamano.ancho + tolerancias.horizontal &&
               dimensiones.alto <= tamano.alto + tolerancias.vertical;
    }

    function cabeRotado(dimensiones, tamano, tolerancias) {
        return dimensiones.ancho <= tamano.alto + tolerancias.horizontal &&
               dimensiones.alto <= tamano.ancho + tolerancias.vertical;
    }

    function cabeEnTamano(dimensiones, tamano, tolerancias) {
        return cabeDirecto(dimensiones, tamano, tolerancias) ||
               cabeRotado(dimensiones, tamano, tolerancias);
    }

    function elegirCategoriaMasPequena(dimensiones, catalogo, tolerancias) {
        var categoria = null;
        var menorArea = Infinity;

        for (var i = 0; i < catalogo.length; i++) {
            var tamano = catalogo[i];
            var area = calcularArea(tamano);

            if (cabeEnTamano(dimensiones, tamano, tolerancias) && area < menorArea) {
                categoria = tamano.nombre;
                menorArea = area;
            }
        }

        return categoria;
    }

    function normalizarTolerancias(tolerancias) {
        return {
            horizontal: tolerancias && tolerancias.horizontal !== undefined ? tolerancias.horizontal : 2,
            vertical: tolerancias && tolerancias.vertical !== undefined ? tolerancias.vertical : 2
        };
    }

    function clasificar(dimensiones, tolerancias) {
        return elegirCategoriaMasPequena(
            dimensiones,
            CalculoDeMedidas.obtenerCatalogo(),
            normalizarTolerancias(tolerancias)
        );
    }

    return {
        clasificar: clasificar
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Unidades
// ====================================================================

var Unidades = (function() {

    var FACTOR_A_MM = {};
    FACTOR_A_MM[MeasurementUnits.millimeters] = 1;
    FACTOR_A_MM[MeasurementUnits.centimeters] = 10;
    FACTOR_A_MM[MeasurementUnits.inches] = 25.4;
    FACTOR_A_MM[MeasurementUnits.picas] = 4.23333333333;
    FACTOR_A_MM[MeasurementUnits.points] = 0.35277777778;
    FACTOR_A_MM[MeasurementUnits.agates] = 0.18142857142;

    function obtenerUnidadHorizontal() {
        return app.activeDocument.viewPreferences.horizontalMeasurementUnits;
    }

    function obtenerUnidadVertical() {
        return app.activeDocument.viewPreferences.verticalMeasurementUnits;
    }

    function convertirAMilimetros(valor, unidad) {
        var factor = FACTOR_A_MM[unidad];
        if (factor === undefined) return valor;
        return valor * factor;
    }

    function convertirPuntosAMilimetros(valor) {
        return convertirAMilimetros(valor, MeasurementUnits.points);
    }

    function guardarUnidadesActuales() {
        return {
            horizontal: obtenerUnidadHorizontal(),
            vertical: obtenerUnidadVertical()
        };
    }

    function restaurarUnidades(unidades) {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = unidades.horizontal;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = unidades.vertical;
    }

    function forzarUnidadesEnPuntos() {
        app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
        app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
    }

    function ejecutarConUnidadesEnPuntos(accion) {
        var unidadesOriginales = guardarUnidadesActuales();

        try {
            forzarUnidadesEnPuntos();
            return accion();
        } finally {
            restaurarUnidades(unidadesOriginales);
        }
    }

    return {
        obtenerUnidadHorizontal: obtenerUnidadHorizontal,
        obtenerUnidadVertical: obtenerUnidadVertical,
        convertirAMilimetros: convertirAMilimetros,
        convertirPuntosAMilimetros: convertirPuntosAMilimetros,
        ejecutarConUnidadesEnPuntos: ejecutarConUnidadesEnPuntos
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Adaptador de InDesign
// ====================================================================

var AdaptadorInDesign = (function() {

    var ORIENTACION_HORIZONTAL = obtenerOrientacionHorizontal();
    var ORIENTACION_VERTICAL = obtenerOrientacionVertical();

    function obtenerOrientacionHorizontal() {
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.HORIZONTAL !== undefined) return HorizontalOrVertical.HORIZONTAL;
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.horizontal !== undefined) return HorizontalOrVertical.horizontal;
        return 1752332916;
    }

    function obtenerOrientacionVertical() {
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.VERTICAL !== undefined) return HorizontalOrVertical.VERTICAL;
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.vertical !== undefined) return HorizontalOrVertical.vertical;
        return 1986359924;
    }

    function hayDocumentoAbierto() {
        return app.documents.length > 0;
    }

    function haySeleccion() {
        return app.selection.length > 0;
    }

    function obtenerSeleccion() {
        return app.selection;
    }

    function obtenerPaginaActiva() {
        return app.activeWindow.activePage;
    }

    function obtenerBounds(obj) {
        return obj.geometricBounds;
    }

    function medirElementoEnMilimetros(obj) {
        var bounds = obtenerBounds(obj);
        var unidadHorizontal = Unidades.obtenerUnidadHorizontal();
        var unidadVertical = Unidades.obtenerUnidadVertical();

        return {
            ancho: Unidades.convertirAMilimetros(Math.abs(bounds[3] - bounds[1]), unidadHorizontal),
            alto: Unidades.convertirAMilimetros(Math.abs(bounds[2] - bounds[0]), unidadVertical)
        };
    }

    function crearGuia(pagina, orientacion, posicion) {
        var guia = pagina.guides.add();
        guia.orientation = orientacion;
        guia.location = posicion;
        return guia;
    }

    function crearGuiaHorizontal(pagina, posicionY) {
        return crearGuia(pagina, ORIENTACION_HORIZONTAL, posicionY);
    }

    function crearGuiaVertical(pagina, posicionX) {
        return crearGuia(pagina, ORIENTACION_VERTICAL, posicionX);
    }

    function crearMarcoTexto(pagina, bounds, contenido, puntoTexto) {
        var marco = pagina.textFrames.add();
        marco.geometricBounds = bounds;
        marco.contents = contenido;
        marco.texts[0].pointSize = puntoTexto;
        return marco;
    }

    function obtenerPrimeraPagina() {
        return app.activeDocument.pages[0];
    }

    return {
        hayDocumentoAbierto: hayDocumentoAbierto,
        haySeleccion: haySeleccion,
        obtenerSeleccion: obtenerSeleccion,
        obtenerPaginaActiva: obtenerPaginaActiva,
        medirElementoEnMilimetros: medirElementoEnMilimetros,
        crearGuiaHorizontal: crearGuiaHorizontal,
        crearGuiaVertical: crearGuiaVertical,
        crearMarcoTexto: crearMarcoTexto,
        obtenerPrimeraPagina: obtenerPrimeraPagina
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Depuracion
// ====================================================================

var Depuracion = (function() {

    var mensajes = [];
    var activo = true;

    function limpiar() {
        mensajes = [];
    }

    function registrar(mensaje) {
        if (!activo) return;
        mensajes.push(mensaje);
    }

    function hayMensajes() {
        return mensajes.length > 0;
    }

    function calcularBoundsMarcoDebug(pagina) {
        var boundsPagina = pagina.bounds;
        var altoMarco = Math.max(60, mensajes.length * 10);

        return [
            boundsPagina[2] + 30,
            boundsPagina[1],
            boundsPagina[2] + 30 + altoMarco,
            boundsPagina[3]
        ];
    }

    function crearMarcoDebug() {
        Unidades.ejecutarConUnidadesEnPuntos(function() {
            var pagina = AdaptadorInDesign.obtenerPrimeraPagina();
            var bounds = calcularBoundsMarcoDebug(pagina);
            AdaptadorInDesign.crearMarcoTexto(pagina, bounds, mensajes.join("\n"), 7);
        });
    }

    function mostrar() {
        if (!activo || !hayMensajes()) return;
        try {
            crearMarcoDebug();
        } catch (e) {}
    }

    function desactivar() {
        activo = false;
    }

    return {
        limpiar: limpiar,
        registrar: registrar,
        mostrar: mostrar,
        desactivar: desactivar
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Trazado de guias
// ====================================================================

var TrazadoDeGuias = (function() {

    function calcularCentroRelativoPagina(pagina) {
        var bounds = pagina.bounds;
        var ancho = Math.abs(bounds[3] - bounds[1]);
        var alto = Math.abs(bounds[2] - bounds[0]);

        return {
            x: ancho / 2,
            y: alto / 2
        };
    }

    function registrarCentro(centro) {
        Depuracion.registrar(
            "   Centro página: X=" + Unidades.convertirPuntosAMilimetros(centro.x).toFixed(2) +
            "mm, Y=" + Unidades.convertirPuntosAMilimetros(centro.y).toFixed(2) + "mm"
        );
    }

    function ejecutarTrazado(nombreAccion, accion) {
        Unidades.ejecutarConUnidadesEnPuntos(function() {
            try {
                accion();
                Depuracion.registrar("   " + nombreAccion + " completado.");
            } catch (e) {
                Depuracion.registrar("   ERROR en " + nombreAccion + ": " + e.toString());
            }
        });
    }

    function crearGuiaHorizontalAlCentro(pagina) {
        ejecutarTrazado("Guía horizontal", function() {
            var centro = calcularCentroRelativoPagina(pagina);
            registrarCentro(centro);
            AdaptadorInDesign.crearGuiaHorizontal(pagina, centro.y);
        });
    }

    function crearGuiaVerticalAlCentro(pagina) {
        ejecutarTrazado("Guía vertical", function() {
            var centro = calcularCentroRelativoPagina(pagina);
            registrarCentro(centro);
            AdaptadorInDesign.crearGuiaVertical(pagina, centro.x);
        });
    }

    function crearGuiasCentrales(pagina) {
        crearGuiaHorizontalAlCentro(pagina);
        crearGuiaVerticalAlCentro(pagina);
    }

    return {
        crearGuiaHorizontalAlCentro: crearGuiaHorizontalAlCentro,
        crearGuiasCentrales: crearGuiasCentrales
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Validacion de ejecucion
// ====================================================================

var ValidacionDeEjecucion = (function() {

    function validarDocumento() {
        if (AdaptadorInDesign.hayDocumentoAbierto()) return true;
        Depuracion.registrar("ERROR: No hay documento abierto.");
        return false;
    }

    function validarSeleccion() {
        if (AdaptadorInDesign.haySeleccion()) return true;
        Depuracion.registrar("ERROR: No hay elementos seleccionados.");
        return false;
    }

    function validarEntorno() {
        return validarDocumento() && validarSeleccion();
    }

    return {
        validarEntorno: validarEntorno
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Maquetacion por categoria
// ====================================================================

var MaquetacionPorCategoria = (function() {

    var opciones = {
        tolerancias: { horizontal: 2, vertical: 2 }
    };

    function configurar(config) {
        if (config && config.tolerancias) {
            opciones.tolerancias = config.tolerancias;
        }
    }

    function analizarElemento(elemento) {
        var dimensiones = AdaptadorInDesign.medirElementoEnMilimetros(elemento);
        var categoria = ClasificacionDeFormato.clasificar(dimensiones, opciones.tolerancias);

        Depuracion.registrar(
            "Elemento: " + dimensiones.ancho.toFixed(2) +
            " x " + dimensiones.alto.toFixed(2) + " mm -> " + categoria
        );

        return {
            categoria: categoria,
            ancho: dimensiones.ancho,
            alto: dimensiones.alto
        };
    }

    function obtenerPaginaParaMaquetar() {
        var pagina = AdaptadorInDesign.obtenerPaginaActiva();
        if (!pagina) {
            Depuracion.registrar("-> ERROR: No se pudo obtener la página activa.");
        }
        return pagina;
    }

    function aplicarMaquetacionCuartoCarta(pagina) {
        Depuracion.registrar("-> Cuarto Carta: creando guías horizontal y vertical al centro...");
        TrazadoDeGuias.crearGuiasCentrales(pagina);
    }

    function aplicarMaquetacionMediaCarta(pagina) {
        Depuracion.registrar("-> Media Carta: creando guía horizontal al centro...");
        TrazadoDeGuias.crearGuiaHorizontalAlCentro(pagina);
    }

    function aplicarMaquetacionSegunCategoria(resultado) {
        if (resultado.categoria !== "Cuarto Carta" && resultado.categoria !== "Media Carta") return;

        var pagina = obtenerPaginaParaMaquetar();
        if (!pagina) return;

        if (resultado.categoria === "Cuarto Carta") {
            aplicarMaquetacionCuartoCarta(pagina);
        } else if (resultado.categoria === "Media Carta") {
            aplicarMaquetacionMediaCarta(pagina);
        }
    }

    function armarResultado(indice, analisis) {
        return {
            indice: indice,
            categoria: analisis.categoria || "Sin categoría",
            ancho: analisis.ancho,
            alto: analisis.alto
        };
    }

    function procesarElemento(elemento, indice) {
        var analisis = analizarElemento(elemento);
        aplicarMaquetacionSegunCategoria(analisis);
        return armarResultado(indice, analisis);
    }

    function procesarSeleccion() {
        var seleccion = AdaptadorInDesign.obtenerSeleccion();
        var resultados = [];

        for (var i = 0; i < seleccion.length; i++) {
            resultados.push(procesarElemento(seleccion[i], i + 1));
        }

        return resultados;
    }

    return {
        configurar: configurar,
        procesarSeleccion: procesarSeleccion
    };

})();

// ====================================================================
// BOUNDED CONTEXT: Presentacion de resultados
// ====================================================================

var PresentacionDeResultados = (function() {

    function registrarEncabezado() {
        Depuracion.registrar("=== RESULTADOS ===");
    }

    function registrarResultado(resultado) {
        Depuracion.registrar(
            "Elemento " + resultado.indice + ": " + resultado.categoria +
            " (" + resultado.ancho.toFixed(2) + " x " + resultado.alto.toFixed(2) + ")"
        );
    }

    function mostrarResultados(resultados) {
        registrarEncabezado();
        for (var i = 0; i < resultados.length; i++) {
            registrarResultado(resultados[i]);
        }
    }

    return {
        mostrarResultados: mostrarResultados
    };

})();

// ====================================================================
// APLICACION
// ====================================================================

var Aplicacion = (function() {

    function iniciarDepuracion() {
        Depuracion.limpiar();
        Depuracion.registrar("=== INICIO DEPURACIÓN ===");
    }

    function configurarProcesos(config) {
        MaquetacionPorCategoria.configurar(config);
    }

    function ejecutarFlujoPrincipal() {
        var resultados = MaquetacionPorCategoria.procesarSeleccion();
        PresentacionDeResultados.mostrarResultados(resultados);
    }

    function finalizarDepuracion() {
        Depuracion.mostrar();
    }

    function ejecutar(config) {
        iniciarDepuracion();

        if (!ValidacionDeEjecucion.validarEntorno()) {
            finalizarDepuracion();
            return;
        }

        configurarProcesos(config);
        ejecutarFlujoPrincipal();
        finalizarDepuracion();
    }

    return {
        ejecutar: ejecutar
    };

})();

// ====================================================================
// ENTRY POINT
// ====================================================================

Aplicacion.ejecutar(CONFIG);
