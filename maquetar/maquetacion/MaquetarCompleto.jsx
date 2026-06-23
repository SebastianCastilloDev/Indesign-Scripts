var MaquetarCompleto = (function() {

    // 1-up: no se duplica nada. Solo se marca el borde de corte real cuando el
    // papel lo define (Tamaño 14 → 274 mm; Tamaño Carta → ninguna guía).
    function procesarElemento(obj, pagina, papel) {
        TrazadoDeGuias.trazarGuiasDeVerificacion(pagina, papel);
        Depuracion.registrar("Completo (" + papel.nombre + "): sin duplicación; " +
                             papel.verificacionMm.length + " guía(s) de verificación.");
        return [];
    }

    return {
        procesarElemento: procesarElemento
    };

})();
