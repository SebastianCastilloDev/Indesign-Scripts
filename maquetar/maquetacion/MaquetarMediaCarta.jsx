var MaquetarMediaCarta = (function() {

    function validarObjetoBase(obj, pagina) {
        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina);
        if (superposicion === "horizontal" || superposicion === "ambas") {
            return "El elemento seleccionado está encima de la guía horizontal del centro de página.";
        }

        if (!Bounds.estaEnMitadSuperior(Bounds.deObjeto(obj), Bounds.dePagina(pagina))) {
            return "El elemento seleccionado debe estar contenido en la mitad superior de la página.";
        }

        return null;
    }

    function procesarElemento(obj, pagina) {
        TrazadoDeGuias.trazarSoloHorizontal(pagina);

        var error = validarObjetoBase(obj, pagina);
        if (error !== null) {
            alert(error);
            return null;
        }

        var copia = RepeticionDeCuadrantes.duplicarVertical(obj, pagina);
        Depuracion.registrar("Elemento Media Carta duplicado hacia la mitad inferior sin rotación.");
        return [copia];
    }

    return {
        procesarElemento: procesarElemento,
        validarObjetoBase: validarObjetoBase
    };

})();
