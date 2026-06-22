var TrazadoDeGuias = require("../maquetar/lib/geometria/trazadoDeGuias.js");

describe("TrazadoDeGuias", function() {

    describe("calcularCentroHorizontal", function() {

        it("debe calcular el centro horizontal de una página", function() {
            var pagina = { bounds: [0, 0, 100, 200] };
            expect(TrazadoDeGuias.calcularCentroHorizontal(pagina)).toBe(100);
        });

        it("debe calcular correctamente con coordenadas no cero", function() {
            var pagina = { bounds: [50, 100, 150, 300] };
            expect(TrazadoDeGuias.calcularCentroHorizontal(pagina)).toBe(200);
        });

        it("debe funcionar con página horizontal (landscape)", function() {
            var pagina = { bounds: [0, 0, 200, 400] };
            expect(TrazadoDeGuias.calcularCentroHorizontal(pagina)).toBe(200);
        });

    });

    describe("calcularCentroVertical", function() {

        it("debe calcular el centro vertical de una página", function() {
            var pagina = { bounds: [0, 0, 100, 200] };
            expect(TrazadoDeGuias.calcularCentroVertical(pagina)).toBe(50);
        });

        it("debe calcular correctamente con coordenadas no cero", function() {
            var pagina = { bounds: [50, 100, 150, 300] };
            expect(TrazadoDeGuias.calcularCentroVertical(pagina)).toBe(100);
        });

        it("debe funcionar con página vertical (portrait)", function() {
            var pagina = { bounds: [0, 0, 300, 200] };
            expect(TrazadoDeGuias.calcularCentroVertical(pagina)).toBe(150);
        });

    });

});
