// Mock de MeasurementUnits de InDesign (FourCharCodes como enteros)
global.MeasurementUnits = {
    millimeters: 2053729891,
    centimeters: 2053332595,
    inches:      2053729897,
    picas:       2053391987,
    points:      2053391988,
    agates:      2053331557
};

var Unidades = require("../maquetar/unidades/unidades.js");

describe("Unidades", function() {

    describe("convertirAMilimetros", function() {

        it("debe convertir milímetros a mm (factor 1)", function() {
            expect(Unidades.convertirAMilimetros(10, MeasurementUnits.millimeters)).toBe(10);
        });

        it("debe convertir centímetros a mm (factor 10)", function() {
            expect(Unidades.convertirAMilimetros(1, MeasurementUnits.centimeters)).toBe(10);
        });

        it("debe convertir pulgadas a mm (factor 25.4)", function() {
            expect(Unidades.convertirAMilimetros(1, MeasurementUnits.inches)).toBe(25.4);
        });

        it("debe convertir puntos a mm (factor ~0.35278)", function() {
            var resultado = Unidades.convertirAMilimetros(1, MeasurementUnits.points);
            expect(resultado).toBeCloseTo(0.35277777778, 10);
        });

        it("debe retornar valor original si la unidad es desconocida", function() {
            expect(Unidades.convertirAMilimetros(42, 999999999)).toBe(42);
        });

    });

    describe("convertirPuntosAMilimetros", function() {

        it("debe convertir 10 puntos a mm correctamente", function() {
            var resultado = Unidades.convertirPuntosAMilimetros(10);
            expect(resultado).toBeCloseTo(3.5277777778, 10);
        });

        it("debe convertir 0 puntos a 0 mm", function() {
            expect(Unidades.convertirPuntosAMilimetros(0)).toBe(0);
        });

        it("debe convertir valores negativos correctamente", function() {
            var resultado = Unidades.convertirPuntosAMilimetros(-10);
            expect(resultado).toBeCloseTo(-3.5277777778, 10);
        });

    });

});
