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
            var b = Bounds.deObjeto(obj);
            Depuracion.registrarDetalle("    " + etiqueta + " tipo: " + obtenerNombreObjeto(obj));
            Depuracion.registrarDetalle("    " + etiqueta + " bounds: top=" + b.top + " left=" + b.left + " bottom=" + b.bottom + " right=" + b.right);
            Depuracion.registrarDetalle("    " + etiqueta + " centro: [" + Bounds.centroX(b) + ", " + Bounds.centroY(b) + "]");
            Depuracion.registrarDetalle("    " + etiqueta + " ancho/alto: " + Bounds.ancho(b) + " x " + Bounds.alto(b));
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
        registrarElementosInternos: registrarElementosInternos
    };

})();
