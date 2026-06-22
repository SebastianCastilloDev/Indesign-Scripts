// ====================================================================
// NUCLEO PURO (conversiones)
// ====================================================================

#include "lib/unidades.js"

// ====================================================================
// CAPA InDesign (API-dependent)
// ====================================================================

Unidades.obtenerUnidadHorizontal = function() {
    return app.activeDocument.viewPreferences.horizontalMeasurementUnits;
};

Unidades.obtenerUnidadVertical = function() {
    return app.activeDocument.viewPreferences.verticalMeasurementUnits;
};

function guardarUnidadesActuales() {
    return {
        horizontal: Unidades.obtenerUnidadHorizontal(),
        vertical: Unidades.obtenerUnidadVertical()
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

Unidades.ejecutarConUnidadesEnPuntos = function(accion) {
    var uOrig = guardarUnidadesActuales();
    try {
        forzarUnidadesEnPuntos();
        return accion();
    } finally {
        restaurarUnidades(uOrig);
    }
};
