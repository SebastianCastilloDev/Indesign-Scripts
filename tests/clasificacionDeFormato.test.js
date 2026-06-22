// ClasificacionDeFormato depende de CalculoDeMedidas global
global.CalculoDeMedidas = require("../maquetar/lib/formatos/calculoDeMedidas.js");
var ClasificacionDeFormato = require("../maquetar/lib/formatos/clasificacionDeFormato.js");

var CARTA = CalculoDeMedidas.CARTA;
var MEDIA_CARTA = CalculoDeMedidas.MEDIA_CARTA;
var CUARTO_CARTA = CalculoDeMedidas.CUARTO_CARTA;

describe("ClasificacionDeFormato", function() {

    describe("clasificar", function() {

        it("debe clasificar como Carta cuando las dimensiones son exactas a Carta", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: 215.9, alto: 279.4 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Carta");
        });

        it("debe clasificar como Carta cuando las dimensiones caben dentro de Carta con tolerancia", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: 217.5, alto: 280.9 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Carta");
        });

        it("debe clasificar como Carta cuando las dimensiones caben rotadas dentro de Carta", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: 279.4, alto: 215.9 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Carta");
        });

        it("debe clasificar como Media Carta cuando las dimensiones son exactas a Media Carta", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: MEDIA_CARTA.ancho, alto: MEDIA_CARTA.alto },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Media Carta");
        });

        it("debe clasificar como Cuarto Carta cuando las dimensiones son exactas a Cuarto Carta", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: CUARTO_CARTA.ancho, alto: CUARTO_CARTA.alto },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Cuarto Carta");
        });

        it("debe preferir el formato más pequeño que quepa (Cuarto Carta sobre Carta)", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: 100, alto: 130 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Cuarto Carta");
        });

        it("debe retornar null si no cabe en ningún formato", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: 300, alto: 400 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBeNull();
        });

        it("debe usar tolerancias por defecto de 2mm si no se proporcionan", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: 217.5, alto: 280.9 }
            );
            expect(resultado).toBe("Carta");
        });

        it("debe tolerar dimensiones ligeramente mayores (dentro de tolerancia)", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: CARTA.ancho + 1.5, alto: CARTA.alto + 1.5 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBe("Carta");
        });

        it("debe rechazar dimensiones fuera de tolerancia", function() {
            var resultado = ClasificacionDeFormato.clasificar(
                { ancho: CARTA.ancho + 3, alto: CARTA.alto + 3 },
                { horizontal: 2, vertical: 2 }
            );
            expect(resultado).toBeNull();
        });

    });

});
