var DepuracionGeometrica = (function() {

    function obtenerNombreObjeto(obj) {
        try {
            return obj.constructor && obj.constructor.name ? obj.constructor.name : "desconocido";
        } catch (e) {
            return "desconocido";
        }
    }

    function registrarBounds(etiqueta, obj) {
        if (!Depuracion.esDetallada()) return;

        try {
            var bounds = obj.geometricBounds;
            Depuracion.registrarDetalle("    " + etiqueta + " tipo: " + obtenerNombreObjeto(obj));
            Depuracion.registrarDetalle("    " + etiqueta + " bounds: [" + bounds.join(", ") + "]");
            Depuracion.registrarDetalle("    " + etiqueta + " centro: [" + ((bounds[1] + bounds[3]) / 2) + ", " + ((bounds[0] + bounds[2]) / 2) + "]");
            Depuracion.registrarDetalle("    " + etiqueta + " ancho/alto: " + Math.abs(bounds[3] - bounds[1]) + " x " + Math.abs(bounds[2] - bounds[0]));
        } catch (e) {
            Depuracion.registrarDetalle("    " + etiqueta + " bounds no disponibles: " + e.toString());
        }
    }

    function registrarElementosInternos(etiqueta, obj) {
        if (!Depuracion.esDetallada()) return;

        try {
            var elementos = obj.allPageItems || obj.pageItems;
            if (!elementos) return;

            Depuracion.registrarDetalle("    " + etiqueta + " elementos internos: " + elementos.length);
            for (var i = 0; i < elementos.length && i < 30; i++) {
                var item = elementos[i];
                var bounds = item.geometricBounds;
                Depuracion.registrarDetalle("      [" + i + "] " + obtenerNombreObjeto(item) + " bounds: [" + bounds.join(", ") + "] rotation: " + item.rotationAngle);
            }
        } catch (e) {
            Depuracion.registrarDetalle("    " + etiqueta + " elementos internos no disponibles: " + e.toString());
        }
    }

    return {
        registrarBounds: registrarBounds,
        registrarElementosInternos: registrarElementosInternos,
        obtenerNombreObjeto: obtenerNombreObjeto
    };

})();
