// ====================================================================
// NUCLEO PURO (cálculo de centros)
// ====================================================================

#include "trazadoDeGuias.js"

// ====================================================================
// CAPA InDesign (API-dependent)
// ====================================================================

TrazadoDeGuias.trazarHorizontal = function(pagina) {
    var centroY = TrazadoDeGuias.calcularCentroVertical(pagina);
    return AdaptadorInDesign.crearGuiaHorizontal(pagina, centroY);
};

TrazadoDeGuias.trazarVertical = function(pagina) {
    var centroX = TrazadoDeGuias.calcularCentroHorizontal(pagina);
    return AdaptadorInDesign.crearGuiaVertical(pagina, centroX);
};

TrazadoDeGuias.trazarSoloHorizontal = function(pagina) {
    Depuracion.registrar("Trazando guía horizontal en centro de página");
    TrazadoDeGuias.trazarHorizontal(pagina);
};

TrazadoDeGuias.trazarAmbosEjes = function(pagina) {
    Depuracion.registrar("Trazando guías horizontal y vertical en centro de página");
    TrazadoDeGuias.trazarHorizontal(pagina);
    TrazadoDeGuias.trazarVertical(pagina);
};

// Y (en puntos) de una posición a `mm` del borde superior de la página.
TrazadoDeGuias.posicionHorizontalEnPuntos = function(pagina, mm) {
    return Bounds.dePagina(pagina).top + Unidades.convertirMilimetrosAPuntos(mm);
};

// Traza una guía horizontal a una distancia absoluta en mm del borde superior.
// Sirve para el eje de plegado (137) y para la guía de verificación (274).
TrazadoDeGuias.trazarGuiaHorizontalEnMm = function(pagina, mm) {
    var y = TrazadoDeGuias.posicionHorizontalEnPuntos(pagina, mm);
    Depuracion.registrar("Trazando guía horizontal en " + mm + " mm");
    return AdaptadorInDesign.crearGuiaHorizontal(pagina, y);
};
