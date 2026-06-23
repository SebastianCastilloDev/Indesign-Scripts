var Papeles = (function() {

    // El diseño SIEMPRE se hace sobre una hoja Carta tradicional en InDesign.
    // El "alto real" de impresión puede ser menor (Tamaño 14 = 274 mm).
    var ANCHO_MM = 215.9;
    var ALTO_DISENO_MM = 279.4;

    // Códigos de variante (= cómo se reparte la selección en la hoja).
    // Son las claves de despacho hacia cada handler de imposición.
    var VARIANTE = {
        COMPLETO: "completo",
        MEDIA: "media",
        CUARTO: "cuarto"
    };

    // Un papel queda definido por su alto real; todo lo demás se deriva.
    function crearPapel(nombre, altoMm) {
        return {
            nombre: nombre,
            ancho: ANCHO_MM,
            alto: altoMm,

            // Ejes de plegado, en mm desde el borde superior/izquierdo de la hoja.
            // En Carta el eje horizontal coincide con el centro real (139.7);
            // en Tamaño 14 cae en 137, que NO es el centro de la hoja de diseño.
            ejeHorizontalMm: altoMm / 2,
            ejeVerticalMm: ANCHO_MM / 2,

            // Si el alto real difiere de la hoja de diseño, se marca su borde
            // como guía de corte (Tamaño 14 → [274]; Carta → []).
            verificacionMm: (altoMm === ALTO_DISENO_MM) ? [] : [altoMm],

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

    var TAMANO_CARTA = crearPapel("Tamaño Carta", ALTO_DISENO_MM);
    var TAMANO_14    = crearPapel("Tamaño 14", 274);

    function porNombre(nombre) {
        return (nombre === TAMANO_14.nombre) ? TAMANO_14 : TAMANO_CARTA;
    }

    return {
        VARIANTE: VARIANTE,
        TAMANO_CARTA: TAMANO_CARTA,
        TAMANO_14: TAMANO_14,
        porNombre: porNombre
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Papeles;
}
