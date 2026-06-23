var TrazadoDeGuias = (function() {

    function calcularCentroHorizontal(pagina) {
        return Bounds.centroX(Bounds.dePagina(pagina));
    }

    function calcularCentroVertical(pagina) {
        return Bounds.centroY(Bounds.dePagina(pagina));
    }

    return {
        calcularCentroHorizontal: calcularCentroHorizontal,
        calcularCentroVertical: calcularCentroVertical
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = TrazadoDeGuias;
}
