var TrazadoDeGuias = (function() {

    function calcularCentroHorizontal(pagina) {
        var bounds = pagina.bounds;
        return (bounds[1] + bounds[3]) / 2;
    }

    function calcularCentroVertical(pagina) {
        var bounds = pagina.bounds;
        return (bounds[0] + bounds[2]) / 2;
    }

    function trazarHorizontal(pagina) {
        var centroY = calcularCentroVertical(pagina);
        return AdaptadorInDesign.crearGuiaHorizontal(pagina, centroY);
    }

    function trazarVertical(pagina) {
        var centroX = calcularCentroHorizontal(pagina);
        return AdaptadorInDesign.crearGuiaVertical(pagina, centroX);
    }

    function trazarSoloHorizontal(pagina) {
        Depuracion.registrar("Trazando guía horizontal en centro de página");
        trazarHorizontal(pagina);
    }

    function trazarAmbosEjes(pagina) {
        Depuracion.registrar("Trazando guías horizontal y vertical en centro de página");
        trazarHorizontal(pagina);
        trazarVertical(pagina);
    }

    return {
        trazarSoloHorizontal: trazarSoloHorizontal,
        trazarAmbosEjes: trazarAmbosEjes
    };

})();
