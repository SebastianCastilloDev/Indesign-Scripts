var ValidacionDeEjecucion = (function() {

    function validar() {
        if (!AdaptadorInDesign.hayDocumentoAbierto()) {
            Depuracion.registrar("Error: No hay un documento abierto.");
            return false;
        }

        if (!AdaptadorInDesign.haySeleccion()) {
            Depuracion.registrar("Error: No hay elementos seleccionados.");
            return false;
        }

        return true;
    }

    return {
        validar: validar
    };

})();
