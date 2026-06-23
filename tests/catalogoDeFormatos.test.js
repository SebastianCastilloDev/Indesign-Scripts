const CatalogoDeFormatos = require("../maquetar/formatos/catalogoDeFormatos.js");

describe("CatalogoDeFormatos", function() {

    describe("CARTA", function() {
        it("debe tener nombre 'Carta'", function() {
            expect(CatalogoDeFormatos.CARTA.nombre).toBe("Carta");
        });

        it("debe medir 215.9 x 279.4 mm", function() {
            expect(CatalogoDeFormatos.CARTA.ancho).toBe(215.9);
            expect(CatalogoDeFormatos.CARTA.alto).toBe(279.4);
        });
    });

    describe("MEDIA_CARTA", function() {
        it("debe tener nombre 'Media Carta'", function() {
            expect(CatalogoDeFormatos.MEDIA_CARTA.nombre).toBe("Media Carta");
        });

        it("debe medir la mitad del alto de Carta como ancho, y el ancho de Carta como alto", function() {
            expect(CatalogoDeFormatos.MEDIA_CARTA.ancho).toBe(279.4 / 2);
            expect(CatalogoDeFormatos.MEDIA_CARTA.alto).toBe(215.9);
        });
    });

    describe("CUARTO_CARTA", function() {
        it("debe tener nombre 'Cuarto Carta'", function() {
            expect(CatalogoDeFormatos.CUARTO_CARTA.nombre).toBe("Cuarto Carta");
        });

        it("debe medir la mitad de Carta en ambos ejes", function() {
            expect(CatalogoDeFormatos.CUARTO_CARTA.ancho).toBe(215.9 / 2);
            expect(CatalogoDeFormatos.CUARTO_CARTA.alto).toBe(279.4 / 2);
        });
    });

    describe("obtenerCatalogo", function() {
        it("debe retornar los 3 formatos en orden: Carta, Media Carta, Cuarto Carta", function() {
            var catalogo = CatalogoDeFormatos.obtenerCatalogo();
            expect(catalogo).toHaveLength(3);
            expect(catalogo[0].nombre).toBe("Carta");
            expect(catalogo[1].nombre).toBe("Media Carta");
            expect(catalogo[2].nombre).toBe("Cuarto Carta");
        });
    });

});
