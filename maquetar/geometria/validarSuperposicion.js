var ValidarSuperposicion = (function() {

    // ejeX/ejeY (opcionales, en la unidad de los bounds): líneas de plegado.
    // Si se omiten, usan el centro de página (comportamiento Carta).
    function validarSuperposicionObjetoConLineaGuia(obj, pagina, ejeX, ejeY) {
        var bo = Bounds.deObjeto(obj);
        var bp = Bounds.dePagina(pagina);
        var cx = (ejeX === undefined) ? Bounds.centroX(bp) : ejeX;
        var cy = (ejeY === undefined) ? Bounds.centroY(bp) : ejeY;

        var sobreHorizontal = (bo.top <= cy && bo.bottom >= cy);
        var sobreVertical   = (bo.left <= cx && bo.right >= cx);

        if (sobreHorizontal && sobreVertical) return "ambas";
        if (sobreHorizontal) return "horizontal";
        if (sobreVertical)   return "vertical";
        return null;
    }

    return {
        validarSuperposicionObjetoConLineaGuia: validarSuperposicionObjetoConLineaGuia
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = ValidarSuperposicion;
}
