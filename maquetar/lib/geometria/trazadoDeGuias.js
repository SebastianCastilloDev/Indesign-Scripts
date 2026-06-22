var TrazadoDeGuias = (function() {

    function calcularCentroHorizontal(pagina) {
        var bounds = pagina.bounds;
        return (bounds[1] + bounds[3]) / 2;
    }

    function calcularCentroVertical(pagina) {
        var bounds = pagina.bounds;
        return (bounds[0] + bounds[2]) / 2;
    }

    return {
        calcularCentroHorizontal: calcularCentroHorizontal,
        calcularCentroVertical: calcularCentroVertical
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = TrazadoDeGuias;
}
