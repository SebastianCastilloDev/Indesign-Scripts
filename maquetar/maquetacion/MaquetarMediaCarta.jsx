var MaquetarMediaCarta = (function() {

    function estaEnMitadSuperior(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroY = (pBounds[0] + pBounds[2]) / 2;
        var bounds = obj.geometricBounds;

        return bounds[0] >= pBounds[0] &&
               bounds[2] <= centroY;
    }

    function validarObjetoBase(obj, pagina) {
        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina);
        if (superposicion === "horizontal" || superposicion === "ambas") {
            alert("El elemento seleccionado está encima de la guía horizontal del centro de página.");
            return false;
        }

        if (!estaEnMitadSuperior(obj, pagina)) {
            alert("El elemento seleccionado debe estar contenido en la mitad superior de la página.");
            return false;
        }

        return true;
    }

    function procesarElemento(obj, pagina) {
        TrazadoDeGuias.trazarSoloHorizontal(pagina);

        if (!validarObjetoBase(obj, pagina)) {
            return false;
        }

        RepeticionDeCuadrantes.duplicarVertical(obj, pagina);
        Depuracion.registrar("Elemento Media Carta duplicado hacia la mitad inferior sin rotación.");
        return true;
    }

    return {
        procesarElemento: procesarElemento,
        validarObjetoBase: validarObjetoBase,
        estaEnMitadSuperior: estaEnMitadSuperior
    };

})();
