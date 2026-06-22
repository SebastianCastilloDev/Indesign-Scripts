var Unidades = (function() {

    var FACTOR_A_MM = {};
    FACTOR_A_MM[MeasurementUnits.millimeters] = 1;
    FACTOR_A_MM[MeasurementUnits.centimeters] = 10;
    FACTOR_A_MM[MeasurementUnits.inches] = 25.4;
    FACTOR_A_MM[MeasurementUnits.picas] = 4.23333333333;
    FACTOR_A_MM[MeasurementUnits.points] = 0.35277777778;
    FACTOR_A_MM[MeasurementUnits.agates] = 0.18142857142;

    function convertirAMilimetros(valor, unidad) {
        var factor = FACTOR_A_MM[unidad];
        if (factor === undefined) return valor;
        return valor * factor;
    }

    function convertirPuntosAMilimetros(valor) {
        return convertirAMilimetros(valor, MeasurementUnits.points);
    }

    return {
        convertirAMilimetros: convertirAMilimetros,
        convertirPuntosAMilimetros: convertirPuntosAMilimetros,
        FACTOR_A_MM: FACTOR_A_MM
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Unidades;
}
