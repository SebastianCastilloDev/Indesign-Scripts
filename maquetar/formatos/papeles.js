var Papeles = (function() {

    var ANCHO_MM = 215.9;

    // Códigos de variante (= cómo se reparte la selección en la hoja).
    // Son las claves de despacho hacia cada handler de imposición.
    var VARIANTE = {
        COMPLETO: "completo",
        MEDIA: "media",
        CUARTO: "cuarto"
    };

    // Un papel queda definido por su alto real; todo lo demás se deriva.
    // verificacionMm (opcional): guías de corte para cuando el formato real NO
    // coincide con la hoja de diseño de InDesign. Solo el Tamaño 14 las usa (se
    // diseña sobre Carta y se corta en 274). Los demás se diseñan sobre su
    // propia hoja, así que no llevan guía de corte.
    function crearPapel(nombre, altoMm, verificacionMm) {
        return {
            nombre: nombre,
            ancho: ANCHO_MM,
            alto: altoMm,

            // Ejes de plegado, en mm desde el borde superior/izquierdo de la hoja.
            ejeHorizontalMm: altoMm / 2,
            ejeVerticalMm: ANCHO_MM / 2,

            verificacionMm: verificacionMm || [],

            // Catálogo de variantes para clasificar la selección contra ESTE papel.
            obtenerCatalogo: function() {
                return [
                    { nombre: VARIANTE.COMPLETO, ancho: ANCHO_MM,     alto: altoMm },
                    { nombre: VARIANTE.MEDIA,    ancho: ANCHO_MM,     alto: altoMm / 2 },
                    { nombre: VARIANTE.CUARTO,   ancho: ANCHO_MM / 2, alto: altoMm / 2 }
                ];
            }
        };
    }

    // Para agregar un papel: definirlo acá y sumarlo a TODOS. El modal se arma
    // solo desde esa lista; las variantes y handlers se reutilizan sin tocar nada.
    var TAMANO_CARTA  = crearPapel("Tamaño Carta", 279.4);
    var TAMANO_14     = crearPapel("Tamaño 14", 274, [274]);
    var TAMANO_OFICIO = crearPapel("Tamaño Oficio", 330);

    var TODOS = [TAMANO_CARTA, TAMANO_14, TAMANO_OFICIO];

    function todos() {
        return TODOS;
    }

    function porNombre(nombre) {
        for (var i = 0; i < TODOS.length; i++) {
            if (TODOS[i].nombre === nombre) return TODOS[i];
        }
        return TAMANO_CARTA;
    }

    return {
        VARIANTE: VARIANTE,
        TAMANO_CARTA: TAMANO_CARTA,
        TAMANO_14: TAMANO_14,
        TAMANO_OFICIO: TAMANO_OFICIO,
        todos: todos,
        porNombre: porNombre
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Papeles;
}
