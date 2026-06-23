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

    function estaEnMitadSuperior(objBounds, paginaBounds) {
        return objBounds.top >= paginaBounds.top &&
               objBounds.bottom <= centroY(paginaBounds);
    }

    function estaEnCuadranteSuperiorIzquierdo(objBounds, paginaBounds) {
        return objBounds.top >= paginaBounds.top &&
               objBounds.left >= paginaBounds.left &&
               objBounds.bottom <= centroY(paginaBounds) &&
               objBounds.right <= centroX(paginaBounds);
    }

    return {
        deObjeto: deObjeto,
        dePagina: dePagina,
        centroX: centroX,
        centroY: centroY,
        ancho: ancho,
        alto: alto,
        estaEnMitadSuperior: estaEnMitadSuperior,
        estaEnCuadranteSuperiorIzquierdo: estaEnCuadranteSuperiorIzquierdo
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = Bounds;
}
