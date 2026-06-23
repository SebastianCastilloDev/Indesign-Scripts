var Aplicacion = (function() {

    function iniciarDepuracion(config) {
        Depuracion.configurar(config);
        Depuracion.limpiar();
        Depuracion.registrar("--- Inicio de maquetación ---");
        Depuracion.registrar("Fecha: " + new Date().toLocaleDateString());
    }

    function configurarProcesos(config) {
        MaquetacionPorCategoria.procesar(config);
    }

    function ejecutarFlujoPrincipal(config) {
        if (!ValidacionDeEjecucion.validar()) {
            return;
        }

        Unidades.ejecutarConUnidadesEnPuntos(function() {
            configurarProcesos(config);
        });
    }

    function finalizarDepuracion() {
        PresentacionDeResultados.mostrar();
    }

    function ejecutar(config) {
        try {
            iniciarDepuracion(config);
            ejecutarFlujoPrincipal(config);
            finalizarDepuracion();
        } catch (e) {
            Depuracion.registrar("Error fatal: " + e.toString());
            Depuracion.mostrar();
        }
    }

    return {
        ejecutar: ejecutar
    };

})();
