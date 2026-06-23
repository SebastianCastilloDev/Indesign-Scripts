var MaquetarCuartoCarta = (function() {

    function validarObjetoBase(obj, pagina) {
        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina);
        if (superposicion !== null) {
            return "El elemento seleccionado está encima de la guía " + superposicion + " del centro de página.";
        }

        if (!Bounds.estaEnCuadranteSuperiorIzquierdo(Bounds.deObjeto(obj), Bounds.dePagina(pagina))) {
            return "El elemento seleccionado debe estar contenido en el cuadrante superior izquierdo.";
        }

        return null;
    }

    function procesarElemento(obj, pagina) {
        var error = validarObjetoBase(obj, pagina);
        if (error !== null) {
            alert(error);
            return null;
        }

        TrazadoDeGuias.trazarAmbosEjes(pagina);
        var rep = RepeticionDeCuadrantes.duplicarEnCuadrantes(obj, pagina);
        Depuracion.registrar("Elemento duplicado: superior derecho sin rotar; cuadrantes inferiores con rotación de 180 grados.");
        return [rep.superiorDerecho, rep.inferiorIzquierdo, rep.inferiorDerecho];
    }

    return {
        procesarElemento: procesarElemento,
        validarObjetoBase: validarObjetoBase
    };

})();
