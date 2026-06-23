var MaquetarCuarto = (function() {

    function validarObjetoBase(obj, pagina, ejeY) {
        // El eje vertical es el centro (mismo ancho en ambos papeles) → undefined.
        var superposicion = ValidarSuperposicion.validarSuperposicionObjetoConLineaGuia(obj, pagina, undefined, ejeY);
        if (superposicion !== null) {
            return "El elemento seleccionado está encima de la guía " + superposicion + " de plegado.";
        }

        if (!Bounds.estaEnCuadranteSuperiorIzquierdo(Bounds.deObjeto(obj), Bounds.dePagina(pagina), undefined, ejeY)) {
            return "El elemento seleccionado debe estar contenido en el cuadrante superior izquierdo.";
        }

        return null;
    }

    // papel: define el eje de plegado horizontal (papel.ejeHorizontalMm) y las
    // guías de verificación. El eje vertical es siempre el centro de la página.
    function procesarElemento(obj, pagina, papel) {
        var ejeY = TrazadoDeGuias.posicionHorizontalEnPuntos(pagina, papel.ejeHorizontalMm);

        var error = validarObjetoBase(obj, pagina, ejeY);
        if (error !== null) {
            alert(error);
            return null;
        }

        TrazadoDeGuias.trazarVertical(pagina);
        TrazadoDeGuias.trazarGuiaHorizontalEnMm(pagina, papel.ejeHorizontalMm);
        TrazadoDeGuias.trazarGuiasDeVerificacion(pagina, papel);
        var rep = RepeticionDeCuadrantes.duplicarEnCuadrantes(obj, pagina, ejeY);
        Depuracion.registrar("Cuarto (" + papel.nombre + "): 4-up, cuadrantes inferiores rotados 180°.");
        return [rep.superiorDerecho, rep.inferiorIzquierdo, rep.inferiorDerecho];
    }

    return {
        procesarElemento: procesarElemento,
        validarObjetoBase: validarObjetoBase
    };

})();
