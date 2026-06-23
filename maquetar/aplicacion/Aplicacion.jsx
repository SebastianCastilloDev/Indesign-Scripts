var Aplicacion = (function() {

    function iniciarDepuracion(config) {
        Depuracion.configurar(config);
        Depuracion.limpiar();
        Depuracion.registrar("--- Inicio de maquetación ---");
        Depuracion.registrar("Fecha: " + new Date().toLocaleDateString());
    }

    function ejecutarFlujoPrincipal(config) {
        if (!ValidacionDeEjecucion.validar()) {
            return;
        }

        var papel = SelectorDePapel.elegir(config.papelPorDefecto);
        if (papel === null) {
            Depuracion.registrar("Operación cancelada por el usuario.");
            return;
        }
        Depuracion.registrar("Papel elegido: " + papel.nombre);

        Unidades.ejecutarConUnidadesEnPuntos(function() {
            MaquetacionPorCategoria.procesar(config, papel);
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
            Depuracion.mostrarError("Error fatal: " + e.toString());
        }
    }

    return {
        ejecutar: ejecutar
    };

})();
