var DepuracionGeometrica = (function() {

    function obtenerNombreObjeto(obj) {
        try {
            return obj.constructor && obj.constructor.name ? obj.constructor.name : "desconocido";
        } catch (e) {
            return "desconocido";
        }
    }

    function registrarBounds(etiqueta, obj) {
        try {
            var bounds = obj.geometricBounds;
            Depuracion.registrar("    " + etiqueta + " tipo: " + obtenerNombreObjeto(obj));
            Depuracion.registrar("    " + etiqueta + " bounds: [" + bounds.join(", ") + "]");
            Depuracion.registrar("    " + etiqueta + " centro: [" + ((bounds[1] + bounds[3]) / 2) + ", " + ((bounds[0] + bounds[2]) / 2) + "]");
            Depuracion.registrar("    " + etiqueta + " ancho/alto: " + Math.abs(bounds[3] - bounds[1]) + " x " + Math.abs(bounds[2] - bounds[0]));
        } catch (e) {
            Depuracion.registrar("    " + etiqueta + " bounds no disponibles: " + e.toString());
        }
    }

    function registrarElementosInternos(etiqueta, obj) {
        try {
            var elementos = obj.allPageItems || obj.pageItems;
            if (!elementos) return;

            Depuracion.registrar("    " + etiqueta + " elementos internos: " + elementos.length);
            for (var i = 0; i < elementos.length && i < 30; i++) {
                var item = elementos[i];
                var bounds = item.geometricBounds;
                Depuracion.registrar("      [" + i + "] " + obtenerNombreObjeto(item) + " bounds: [" + bounds.join(", ") + "] rotation: " + item.rotationAngle);
            }
        } catch (e) {
            Depuracion.registrar("    " + etiqueta + " elementos internos no disponibles: " + e.toString());
        }
    }

    return {
        registrarBounds: registrarBounds,
        registrarElementosInternos: registrarElementosInternos,
        obtenerNombreObjeto: obtenerNombreObjeto
    };

})();
