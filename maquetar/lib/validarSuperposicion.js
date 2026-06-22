var ValidarSuperposicion = (function() {

    function validarSuperposicionObjetoConLineaGuia(obj, pagina) {
        var bounds = obj.geometricBounds || obj.bounds || [0, 0, 0, 0];
        var pBounds = pagina.bounds || [0, 0, 0, 0];

        var centroY = (pBounds[0] + pBounds[2]) / 2;
        var centroX = (pBounds[1] + pBounds[3]) / 2;

        var top = bounds[0];
        var bottom = bounds[2];
        var left = bounds[1];
        var right = bounds[3];

        var sobreHorizontal = (top <= centroY && bottom >= centroY);
        var sobreVertical = (left <= centroX && right >= centroX);

        if (sobreHorizontal && sobreVertical) return "ambas";
        if (sobreHorizontal) return "horizontal";
        if (sobreVertical) return "vertical";
        return null;
    }

    return {
        validarSuperposicionObjetoConLineaGuia: validarSuperposicionObjetoConLineaGuia
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = ValidarSuperposicion;
}
