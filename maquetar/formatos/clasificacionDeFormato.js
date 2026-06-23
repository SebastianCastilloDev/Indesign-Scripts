var ClasificacionDeFormato = (function() {

    function calcularArea(tamano) {
        return tamano.ancho * tamano.alto;
    }

    function cabeDirecto(dimensiones, tamano, tolerancias) {
        return dimensiones.ancho <= tamano.ancho + tolerancias.horizontal &&
               dimensiones.alto <= tamano.alto + tolerancias.vertical;
    }

    function cabeRotado(dimensiones, tamano, tolerancias) {
        return dimensiones.ancho <= tamano.alto + tolerancias.horizontal &&
               dimensiones.alto <= tamano.ancho + tolerancias.vertical;
    }

    function cabeEnTamano(dimensiones, tamano, tolerancias) {
        return cabeDirecto(dimensiones, tamano, tolerancias) ||
               cabeRotado(dimensiones, tamano, tolerancias);
    }

    function elegirCategoriaMasPequena(dimensiones, catalogo, tolerancias) {
        var categoria = null;
        var menorArea = Infinity;

        for (var i = 0; i < catalogo.length; i++) {
            var tamano = catalogo[i];
            var area = calcularArea(tamano);

            if (cabeEnTamano(dimensiones, tamano, tolerancias) && area < menorArea) {
                categoria = tamano.nombre;
                menorArea = area;
            }
        }

        return categoria;
    }

    function normalizarTolerancias(tolerancias) {
        return {
            horizontal: tolerancias && tolerancias.horizontal !== undefined ? tolerancias.horizontal : 2,
            vertical: tolerancias && tolerancias.vertical !== undefined ? tolerancias.vertical : 2
        };
    }

    // catalogo (opcional): lista de variantes contra las que clasificar. Si se
    // omite, usa el catálogo global (compatibilidad). El flujo nuevo le pasa el
    // catálogo del papel elegido: Papeles.TAMANO_*.obtenerCatalogo().
    function clasificar(dimensiones, tolerancias, catalogo) {
        var cat = catalogo || CatalogoDeFormatos.obtenerCatalogo();
        return elegirCategoriaMasPequena(
            dimensiones,
            cat,
            normalizarTolerancias(tolerancias)
        );
    }

    return {
        clasificar: clasificar
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = ClasificacionDeFormato;
}
