var ValidarSuperposicion = require("../maquetar/lib/geometria/validarSuperposicion.js");

function crearPagina(ancho, alto) {
    return { bounds: [0, 0, alto, ancho] };
}

function crearObjeto(top, left, bottom, right) {
    return { geometricBounds: [top, left, bottom, right] };
}

describe("ValidarSuperposicion", function() {

    var pagina = crearPagina(400, 600); // centro en X=200, Y=300

    describe("validarSuperposicionObjetoConLineaGuia", function() {

        it("debe retornar 'ambas' cuando el elemento cubre ambos centros", function() {
            var obj = crearObjeto(100, 100, 500, 300); // cubre Y=300 y X=200
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBe("ambas");
        });

        it("debe retornar 'horizontal' cuando el elemento solo cubre el centro vertical (guía horizontal)", function() {
            var obj = crearObjeto(100, 0, 500, 100); // cubre Y=300 pero no X=200
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBe("horizontal");
        });

        it("debe retornar 'vertical' cuando el elemento solo cubre el centro horizontal (guía vertical)", function() {
            var obj = crearObjeto(0, 100, 100, 300); // cubre X=200 pero no Y=300
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBe("vertical");
        });

        it("debe retornar null cuando el elemento no cubre ningún centro", function() {
            var obj = crearObjeto(0, 0, 100, 100); // lejos de ambos centros
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBeNull();
        });

        it("debe detectar superposición cuando el borde toca exactamente el centro vertical (guía horizontal)", function() {
            var obj = crearObjeto(300, 0, 400, 100); // top=300 == centroY, right=100 < centroX=200
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBe("horizontal");
        });

        it("debe detectar superposición cuando el borde inferior toca exactamente el centro", function() {
            var obj = crearObjeto(250, 0, 300, 100); // bottom=300 == centroY
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBe("horizontal");
        });

        it("debe funcionar con página de tamaño personalizado", function() {
            var pag = crearPagina(1000, 500); // centro en X=500, Y=250
            var obj = crearObjeto(0, 500, 500, 1000); // cubre X=500 y Y=250
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pag)).toBe("ambas");
        });

        it("debe manejar bounds como array vacío sin errores", function() {
            var obj = { geometricBounds: [0, 0, 0, 0] };
            expect(ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina)).toBeNull();
        });

    });

});
