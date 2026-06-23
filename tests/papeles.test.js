var Papeles = require("../maquetar/formatos/papeles.js");

describe("Papeles", function() {

    describe("Tamaño Carta", function() {
        var carta = Papeles.TAMANO_CARTA;

        it("mide 215.9 x 279.4 mm", function() {
            expect(carta.ancho).toBe(215.9);
            expect(carta.alto).toBe(279.4);
        });

        it("eje horizontal en el centro real (139.7)", function() {
            expect(carta.ejeHorizontalMm).toBeCloseTo(139.7, 5);
        });

        it("eje vertical en el centro (107.95)", function() {
            expect(carta.ejeVerticalMm).toBeCloseTo(107.95, 5);
        });

        it("sin guías de verificación (hoja real == hoja de diseño)", function() {
            expect(carta.verificacionMm).toEqual([]);
        });

        it("catálogo: completo, media, cuarto derivados del alto", function() {
            var cat = carta.obtenerCatalogo();
            expect(cat).toHaveLength(3);

            expect(cat[0].nombre).toBe("completo");
            expect(cat[0].ancho).toBe(215.9);
            expect(cat[0].alto).toBe(279.4);

            expect(cat[1].nombre).toBe("media");
            expect(cat[1].ancho).toBe(215.9);
            expect(cat[1].alto).toBeCloseTo(139.7, 5);

            expect(cat[2].nombre).toBe("cuarto");
            expect(cat[2].ancho).toBeCloseTo(107.95, 5);
            expect(cat[2].alto).toBeCloseTo(139.7, 5);
        });
    });

    describe("Tamaño 14", function() {
        var t14 = Papeles.TAMANO_14;

        it("mide 215.9 x 274 mm (mismo ancho, menor alto)", function() {
            expect(t14.ancho).toBe(215.9);
            expect(t14.alto).toBe(274);
        });

        it("eje horizontal en 137 (= 274/2), no en el centro de la hoja", function() {
            expect(t14.ejeHorizontalMm).toBe(137);
        });

        it("eje vertical en 107.95 (igual que Carta, mismo ancho)", function() {
            expect(t14.ejeVerticalMm).toBeCloseTo(107.95, 5);
        });

        it("marca guía de verificación en 274 (borde real < hoja de diseño)", function() {
            expect(t14.verificacionMm).toEqual([274]);
        });

        it("catálogo derivado de 274", function() {
            var cat = t14.obtenerCatalogo();
            expect(cat[0].nombre).toBe("completo");
            expect(cat[0].alto).toBe(274);

            expect(cat[1].nombre).toBe("media");
            expect(cat[1].ancho).toBe(215.9);
            expect(cat[1].alto).toBe(137);

            expect(cat[2].nombre).toBe("cuarto");
            expect(cat[2].ancho).toBeCloseTo(107.95, 5);
            expect(cat[2].alto).toBe(137);
        });
    });

    describe("Tamaño Oficio", function() {
        var oficio = Papeles.TAMANO_OFICIO;

        it("mide 215.9 x 330 mm", function() {
            expect(oficio.ancho).toBe(215.9);
            expect(oficio.alto).toBe(330);
        });

        it("eje horizontal en 165 (= 330/2)", function() {
            expect(oficio.ejeHorizontalMm).toBe(165);
        });

        it("sin guías de verificación (se diseña en su propia hoja Oficio)", function() {
            expect(oficio.verificacionMm).toEqual([]);
        });

        it("catálogo derivado de 330", function() {
            var cat = oficio.obtenerCatalogo();
            expect(cat[0].alto).toBe(330);   // completo
            expect(cat[1].alto).toBe(165);   // media
            expect(cat[2].alto).toBe(165);   // cuarto
            expect(cat[2].ancho).toBeCloseTo(107.95, 5);
        });
    });

    describe("todos", function() {
        it("devuelve los 3 papeles", function() {
            var todos = Papeles.todos();
            expect(todos).toHaveLength(3);
            expect(todos).toContain(Papeles.TAMANO_CARTA);
            expect(todos).toContain(Papeles.TAMANO_14);
            expect(todos).toContain(Papeles.TAMANO_OFICIO);
        });
    });

    describe("porNombre", function() {
        it("devuelve Tamaño 14 por su nombre", function() {
            expect(Papeles.porNombre("Tamaño 14")).toBe(Papeles.TAMANO_14);
        });

        it("devuelve Tamaño Oficio por su nombre", function() {
            expect(Papeles.porNombre("Tamaño Oficio")).toBe(Papeles.TAMANO_OFICIO);
        });

        it("devuelve Tamaño Carta por su nombre", function() {
            expect(Papeles.porNombre("Tamaño Carta")).toBe(Papeles.TAMANO_CARTA);
        });

        it("default a Tamaño Carta si el nombre no coincide", function() {
            expect(Papeles.porNombre("desconocido")).toBe(Papeles.TAMANO_CARTA);
        });
    });

});
