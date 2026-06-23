// ====================================================================
// NUCLEO PURO (cálculo de centros)
// ====================================================================

#include "trazadoDeGuias.js"

// ====================================================================
// CAPA InDesign (API-dependent)
// ====================================================================

// El eje vertical (fold de cuarto) siempre es el centro de página: mismo ancho
// en ambos papeles. El horizontal ya no se traza al centro — va por mm (eje de
// plegado del papel) vía trazarGuiaHorizontalEnMm.
TrazadoDeGuias.trazarVertical = function(pagina) {
    var centroX = TrazadoDeGuias.calcularCentroHorizontal(pagina);
    return AdaptadorInDesign.crearGuiaVertical(pagina, centroX);
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

// Dibuja las guías de verificación (borde de corte real) que define el papel.
// Tamaño 14 → una guía en 274 mm; Tamaño Carta → ninguna.
TrazadoDeGuias.trazarGuiasDeVerificacion = function(pagina, papel) {
    for (var i = 0; i < papel.verificacionMm.length; i++) {
        TrazadoDeGuias.trazarGuiaHorizontalEnMm(pagina, papel.verificacionMm[i]);
    }
};
