var Bounds = (function() {

    function deObjeto(obj) {
        var b = obj.geometricBounds || obj.bounds || [0, 0, 0, 0];
        return { top: b[0], left: b[1], bottom: b[2], right: b[3] };
    }

    function dePagina(pagina) {
        var b = pagina.bounds || [0, 0, 0, 0];
        return { top: b[0], left: b[1], bottom: b[2], right: b[3] };
    }

    function centroX(b) { return (b.left + b.right) / 2; }
    function centroY(b) { return (b.top + b.bottom) / 2; }
    function ancho(b) { return Math.abs(b.right - b.left); }
    function alto(b) { return Math.abs(b.bottom - b.top); }

    // ejeY (opcional, en la misma unidad que los bounds): línea de plegado.
    // Si se omite, usa el centro de la página (comportamiento Carta media).
    function estaEnMitadSuperior(objBounds, paginaBounds, ejeY) {
        var eje = (ejeY === undefined) ? centroY(paginaBounds) : ejeY;
        return objBounds.top >= paginaBounds.top &&
               objBounds.bottom <= eje;
    }

    // ejeX/ejeY (opcionales): líneas de plegado. Si se omiten, usan el centro
    // de la página. El eje vertical (ejeX) coincide con el centro en ambos
    // papeles; el horizontal (ejeY) cambia en Tamaño 14 (137 en vez de 139.7).
    function estaEnCuadranteSuperiorIzquierdo(objBounds, paginaBounds, ejeX, ejeY) {
        var ex = (ejeX === undefined) ? centroX(paginaBounds) : ejeX;
        var ey = (ejeY === undefined) ? centroY(paginaBounds) : ejeY;
        return objBounds.top >= paginaBounds.top &&
               objBounds.left >= paginaBounds.left &&
               objBounds.bottom <= ey &&
               objBounds.right <= ex;
    }

    // El objeto está completamente fuera de la página si no hay solapamiento
    // en ninguno de los dos ejes (queda íntegro en el pasteboard).
    function estaFueraDePagina(objBounds, paginaBounds) {
        return objBounds.right <= paginaBounds.left ||
               objBounds.left  >= paginaBounds.right ||
               objBounds.bottom <= paginaBounds.top ||
               objBounds.top    >= paginaBounds.bottom;
    }

    return {
        deObjeto: deObjeto,
        dePagina: dePagina,
        centroX: centroX,
        centroY: centroY,
        ancho: ancho,
        alto: alto,
        estaEnMitadSuperior: estaEnMitadSuperior,
        estaEnCuadranteSuperiorIzquierdo: estaEnCuadranteSuperiorIzquierdo,
        estaFueraDePagina: estaFueraDePagina
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Bounds;
}
