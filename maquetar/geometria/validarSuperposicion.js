var ValidarSuperposicion = (function() {

    function validarSuperposicionObjetoConLineaGuia(obj, pagina) {
        var bo = Bounds.deObjeto(obj);
        var bp = Bounds.dePagina(pagina);
        var cx = Bounds.centroX(bp);
        var cy = Bounds.centroY(bp);

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
