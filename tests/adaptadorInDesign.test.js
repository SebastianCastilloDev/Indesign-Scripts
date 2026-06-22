var AdaptadorInDesign = require("../maquetar/lib/adaptadores/adaptadorInDesign.js");

describe("AdaptadorInDesign (enumeradores)", function() {

    afterEach(function() {
        delete global.HorizontalOrVertical;
    });

    describe("obtenerOrientacionHorizontal", function() {

        it("debe retornar HORIZONTAL cuando HorizontalOrVertical.HORIZONTAL existe", function() {
            global.HorizontalOrVertical = { HORIZONTAL: 111, horizontal: 222 };
            expect(AdaptadorInDesign.obtenerOrientacionHorizontal()).toBe(111);
        });

        it("debe retornar horizontal cuando HORIZONTAL no existe pero horizontal sí", function() {
            global.HorizontalOrVertical = { horizontal: 222 };
            expect(AdaptadorInDesign.obtenerOrientacionHorizontal()).toBe(222);
        });

        it("debe retornar FourCharCode por defecto cuando HorizontalOrVertical no existe", function() {
            delete global.HorizontalOrVertical;
            expect(AdaptadorInDesign.obtenerOrientacionHorizontal()).toBe(1752332916);
        });

        it("debe retornar FourCharCode por defecto cuando las propiedades no existen", function() {
            global.HorizontalOrVertical = { VERTICAL: 333 };
            expect(AdaptadorInDesign.obtenerOrientacionHorizontal()).toBe(1752332916);
        });

    });

    describe("obtenerOrientacionVertical", function() {

        it("debe retornar VERTICAL cuando HorizontalOrVertical.VERTICAL existe", function() {
            global.HorizontalOrVertical = { VERTICAL: 333, vertical: 444 };
            expect(AdaptadorInDesign.obtenerOrientacionVertical()).toBe(333);
        });

        it("debe retornar vertical cuando VERTICAL no existe pero vertical sí", function() {
            global.HorizontalOrVertical = { vertical: 444 };
            expect(AdaptadorInDesign.obtenerOrientacionVertical()).toBe(444);
        });

        it("debe retornar FourCharCode por defecto cuando HorizontalOrVertical no existe", function() {
            delete global.HorizontalOrVertical;
            expect(AdaptadorInDesign.obtenerOrientacionVertical()).toBe(1986359924);
        });

        it("debe retornar FourCharCode por defecto cuando las propiedades no existen", function() {
            global.HorizontalOrVertical = { HORIZONTAL: 111 };
            expect(AdaptadorInDesign.obtenerOrientacionVertical()).toBe(1986359924);
        });

    });

});
