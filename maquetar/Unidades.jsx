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
