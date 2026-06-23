var Bounds = require("../maquetar/geometria/bounds.js");

function pagina(top, left, bottom, right) {
    return { bounds: [top, left, bottom, right] };
}

function objeto(top, left, bottom, right) {
    return { geometricBounds: [top, left, bottom, right] };
}

describe("Bounds", function() {

    describe("deObjeto", function() {
        it("extrae top/left/bottom/right de geometricBounds", function() {
            var b = Bounds.deObjeto(objeto(10, 20, 30, 40));
            expect(b).toEqual({ top: 10, left: 20, bottom: 30, right: 40 });
        });

        it("usa .bounds como fallback si no hay geometricBounds", function() {
            var b = Bounds.deObjeto({ bounds: [1, 2, 3, 4] });
            expect(b).toEqual({ top: 1, left: 2, bottom: 3, right: 4 });
        });

        it("devuelve ceros si no hay ninguna propiedad", function() {
            var b = Bounds.deObjeto({});
            expect(b).toEqual({ top: 0, left: 0, bottom: 0, right: 0 });
        });
    });

    describe("dePagina", function() {
        it("extrae top/left/bottom/right de bounds", function() {
            var b = Bounds.dePagina(pagina(0, 0, 100, 200));
            expect(b).toEqual({ top: 0, left: 0, bottom: 100, right: 200 });
        });
    });

    describe("centroX / centroY", function() {
        it("calcula el centro horizontal", function() {
            var b = { top: 0, left: 0, bottom: 100, right: 200 };
            expect(Bounds.centroX(b)).toBe(100);
        });

        it("calcula el centro vertical", function() {
            var b = { top: 0, left: 0, bottom: 100, right: 200 };
            expect(Bounds.centroY(b)).toBe(50);
        });

        it("funciona con coordenadas no cero", function() {
            var b = { top: 10, left: 20, bottom: 110, right: 220 };
            expect(Bounds.centroX(b)).toBe(120);
            expect(Bounds.centroY(b)).toBe(60);
        });
    });

    describe("ancho / alto", function() {
        it("calcula el ancho correctamente", function() {
            expect(Bounds.ancho({ left: 10, right: 60, top: 0, bottom: 0 })).toBe(50);
        });

        it("calcula el alto correctamente", function() {
            expect(Bounds.alto({ top: 10, bottom: 80, left: 0, right: 0 })).toBe(70);
        });
    });

    describe("estaEnMitadSuperior", function() {
        var bp = { top: 0, left: 0, bottom: 200, right: 100 }; // centroY = 100

        it("devuelve true cuando el objeto está completamente en la mitad superior", function() {
            var bo = { top: 0, left: 0, bottom: 90, right: 50 };
            expect(Bounds.estaEnMitadSuperior(bo, bp)).toBe(true);
        });

        it("devuelve true cuando el borde inferior toca exactamente el centro", function() {
            var bo = { top: 0, left: 0, bottom: 100, right: 50 };
            expect(Bounds.estaEnMitadSuperior(bo, bp)).toBe(true);
        });

        it("devuelve false cuando el objeto cruza el centro vertical", function() {
            var bo = { top: 0, left: 0, bottom: 101, right: 50 };
            expect(Bounds.estaEnMitadSuperior(bo, bp)).toBe(false);
        });

        it("devuelve false cuando el objeto está en la mitad inferior", function() {
            var bo = { top: 110, left: 0, bottom: 190, right: 50 };
            expect(Bounds.estaEnMitadSuperior(bo, bp)).toBe(false);
        });

        it("usa el ejeY explícito en vez del centro cuando se pasa", function() {
            // eje en 80 (más arriba que el centro 100)
            var bo = { top: 0, left: 0, bottom: 80, right: 50 };
            expect(Bounds.estaEnMitadSuperior(bo, bp, 80)).toBe(true);
        });

        it("devuelve false si el objeto cruza el ejeY explícito", function() {
            var bo = { top: 0, left: 0, bottom: 90, right: 50 };
            expect(Bounds.estaEnMitadSuperior(bo, bp, 80)).toBe(false);
        });
    });

    describe("estaEnCuadranteSuperiorIzquierdo", function() {
        var bp = { top: 0, left: 0, bottom: 200, right: 200 }; // centroX = 100, centroY = 100

        it("devuelve true cuando el objeto está completamente en el cuadrante superior izquierdo", function() {
            var bo = { top: 0, left: 0, bottom: 90, right: 90 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp)).toBe(true);
        });

        it("devuelve true cuando los bordes tocan exactamente el centro", function() {
            var bo = { top: 0, left: 0, bottom: 100, right: 100 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp)).toBe(true);
        });

        it("devuelve false cuando el objeto cruza el eje horizontal", function() {
            var bo = { top: 0, left: 0, bottom: 101, right: 90 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp)).toBe(false);
        });

        it("devuelve false cuando el objeto cruza el eje vertical", function() {
            var bo = { top: 0, left: 0, bottom: 90, right: 101 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp)).toBe(false);
        });

        it("devuelve false cuando el objeto está en el cuadrante inferior derecho", function() {
            var bo = { top: 110, left: 110, bottom: 190, right: 190 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp)).toBe(false);
        });

        it("usa ejeY explícito (más arriba que el centro) cuando se pasa", function() {
            var bo = { top: 0, left: 0, bottom: 80, right: 90 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp, undefined, 80)).toBe(true);
        });

        it("devuelve false si el objeto cruza el ejeY explícito", function() {
            var bo = { top: 0, left: 0, bottom: 90, right: 90 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(bo, bp, undefined, 80)).toBe(false);
        });

        it("usa ejeX explícito cuando se pasa", function() {
            var dentro = { top: 0, left: 0, bottom: 90, right: 70 };
            var cruza  = { top: 0, left: 0, bottom: 90, right: 90 };
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(dentro, bp, 80, undefined)).toBe(true);
            expect(Bounds.estaEnCuadranteSuperiorIzquierdo(cruza, bp, 80, undefined)).toBe(false);
        });
    });

    describe("estaFueraDePagina", function() {
        var bp = { top: 0, left: 0, bottom: 200, right: 200 };

        it("devuelve false cuando el objeto está dentro de la página", function() {
            var bo = { top: 50, left: 50, bottom: 150, right: 150 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(false);
        });

        it("devuelve false cuando el objeto solapa parcialmente un borde", function() {
            var bo = { top: 50, left: 150, bottom: 150, right: 250 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(false);
        });

        it("devuelve true cuando el objeto está completamente a la derecha", function() {
            var bo = { top: 50, left: 210, bottom: 150, right: 300 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(true);
        });

        it("devuelve true cuando el objeto está completamente a la izquierda", function() {
            var bo = { top: 50, left: -100, bottom: 150, right: -10 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(true);
        });

        it("devuelve true cuando el objeto está completamente arriba", function() {
            var bo = { top: -100, left: 50, bottom: -10, right: 150 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(true);
        });

        it("devuelve true cuando el objeto está completamente abajo", function() {
            var bo = { top: 210, left: 50, bottom: 300, right: 150 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(true);
        });

        it("devuelve true cuando el objeto solo toca el borde izquierdo (sin solapar)", function() {
            var bo = { top: 50, left: -50, bottom: 150, right: 0 };
            expect(Bounds.estaFueraDePagina(bo, bp)).toBe(true);
        });
    });

});
