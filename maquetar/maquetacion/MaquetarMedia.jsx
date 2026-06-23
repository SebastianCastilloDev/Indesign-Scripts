var MaquetarMedia = (function() {

    function validarObjetoBase(obj, pagina, ejeY) {
        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina, undefined, ejeY);
        if (superposicion === "horizontal" || superposicion === "ambas") {
            return "El elemento seleccionado está encima de la guía horizontal de plegado.";
        }

        if (!Bounds.estaEnMitadSuperior(Bounds.deObjeto(obj), Bounds.dePagina(pagina), ejeY)) {
            return "El elemento seleccionado debe estar contenido en la mitad superior (sobre la guía de plegado).";
        }

        return null;
    }

    // papel: define el eje de plegado (papel.ejeHorizontalMm) y las guías de
    // verificación. Carta → centro real; Tamaño 14 → 137 mm + corte en 274.
    function procesarElemento(obj, pagina, papel) {
        var ejeY = TrazadoDeGuias.posicionHorizontalEnPuntos(pagina, papel.ejeHorizontalMm);

        var error = validarObjetoBase(obj, pagina, ejeY);
        if (error !== null) {
            alert(error);
            return null;
        }

        TrazadoDeGuias.trazarGuiaHorizontalEnMm(pagina, papel.ejeHorizontalMm);
        TrazadoDeGuias.trazarGuiasDeVerificacion(pagina, papel);
        var copia = RepeticionDeCuadrantes.duplicarVertical(obj, pagina, ejeY);
        Depuracion.registrar("Media (" + papel.nombre + "): duplicado a la mitad inferior sin rotación.");
        return [copia];
    }

    return {
        procesarElemento: procesarElemento,
        validarObjetoBase: validarObjetoBase
    };

})();
