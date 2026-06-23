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
