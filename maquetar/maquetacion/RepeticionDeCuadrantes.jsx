var RepeticionDeCuadrantes = (function() {

    function registrarDuplicacion(etiqueta, pagina, obj, centroNombre, centro, posicionNombre, posicion, deltaNombre, delta) {
        if (!Depuracion.esDetallada()) return;

        var bo = Bounds.deObjeto(obj);
        var bp = Bounds.dePagina(pagina);
        Depuracion.registrarDetalle("  DEBUG " + etiqueta + ":");
        Depuracion.registrarDetalle("    page bounds: top=" + bp.top + " left=" + bp.left + " bottom=" + bp.bottom + " right=" + bp.right);
        Depuracion.registrarDetalle("    " + centroNombre + ": " + centro);
        Depuracion.registrarDetalle("    obj bounds: top=" + bo.top + " left=" + bo.left + " bottom=" + bo.bottom + " right=" + bo.right);
        Depuracion.registrarDetalle("    " + posicionNombre + ": " + posicion);
        Depuracion.registrarDetalle("    " + deltaNombre + ": " + delta);
    }

    function registrarDuplicadoMovido(etiquetaCentro, dup, centroFn) {
        if (!Depuracion.esDetallada()) return;

        var b = Bounds.deObjeto(dup);
        Depuracion.registrarDetalle("    dup bounds despues de mover: top=" + b.top + " left=" + b.left + " bottom=" + b.bottom + " right=" + b.right);
        Depuracion.registrarDetalle("    nuevo " + etiquetaCentro + ": " + centroFn(b));
    }

    function duplicarHorizontal(obj, pagina) {
        var bp = Bounds.dePagina(pagina);
        var bo = Bounds.deObjeto(obj);
        var cx = Bounds.centroX(bp);
        var nuevoLeft = 2 * cx - bo.right;
        var deltaX = nuevoLeft - bo.left;

        registrarDuplicacion("duplicarHorizontal", pagina, obj, "centroX", cx, "nuevoLeft", nuevoLeft, "deltaX", deltaX);

        var dup = obj.duplicate();
        dup.move(undefined, [deltaX, 0]);
        registrarDuplicadoMovido("centroElementoX", dup, Bounds.centroX);

        return dup;
    }

    // ejeY (opcional, en puntos): línea de plegado horizontal sobre la que se
    // refleja la copia. Si se omite, usa el centro de la página (Carta media).
    function duplicarVertical(obj, pagina, ejeY) {
        var bp = Bounds.dePagina(pagina);
        var bo = Bounds.deObjeto(obj);
        var cy = (ejeY === undefined) ? Bounds.centroY(bp) : ejeY;
        var nuevoTop = 2 * cy - bo.bottom;
        var deltaY = nuevoTop - bo.top;

        registrarDuplicacion("duplicarVertical", pagina, obj, "ejeY", cy, "nuevoTop", nuevoTop, "deltaY", deltaY);

        var dup = obj.duplicate();
        dup.move(undefined, [0, deltaY]);
        registrarDuplicadoMovido("centroElementoY", dup, Bounds.centroY);

        return dup;
    }

    function rotarMediaVueltaConCorreccion(obj, boundsObjetivo) {
        var anguloActual = typeof obj.rotationAngle === "number" ? obj.rotationAngle : 0;
        Depuracion.registrarDetalle("  DEBUG rotarMediaVuelta:");
        Depuracion.registrarDetalle("    angulo antes: " + anguloActual);
        Depuracion.registrarDetalle("    bounds objetivo: top=" + boundsObjetivo.top + " left=" + boundsObjetivo.left);
        DepuracionGeometrica.registrarBounds("antes de rotar", obj);

        obj.rotationAngle = anguloActual + 180;

        Depuracion.registrarDetalle("    angulo despues: " + obj.rotationAngle);
        DepuracionGeometrica.registrarBounds("despues de rotar", obj);

        var bd = Bounds.deObjeto(obj);
        var deltaX = boundsObjetivo.left - bd.left;
        var deltaY = boundsObjetivo.top  - bd.top;
        Depuracion.registrarDetalle("    delta correccion post-rotacion: [" + deltaX + ", " + deltaY + "]");
        obj.move(undefined, [deltaX, deltaY]);

        DepuracionGeometrica.registrarBounds("despues de corregir posicion", obj);
        DepuracionGeometrica.registrarElementosInternos("despues de rotar", obj);
        return obj;
    }

    // ejeY (opcional, en puntos): eje de plegado horizontal. El vertical siempre
    // es el centro de página (mismo ancho en ambos papeles). En Tamaño 14 el
    // ejeY es 137; si se omite, usa el centro (cuarto Carta).
    function duplicarEnCuadrantes(obj, pagina, ejeY) {
        Depuracion.registrarDetalle("  DEBUG objeto base antes de duplicar:");
        DepuracionGeometrica.registrarBounds("base", obj);
        DepuracionGeometrica.registrarElementosInternos("base", obj);

        var dupHorizontal = duplicarHorizontal(obj, pagina);
        var dupVertical   = duplicarVertical(obj, pagina, ejeY);
        var dupDiagonal   = duplicarVertical(dupHorizontal, pagina, ejeY);

        var boundsVertical = Bounds.deObjeto(dupVertical);
        var boundsDiagonal = Bounds.deObjeto(dupDiagonal);

        rotarMediaVueltaConCorreccion(dupVertical, boundsVertical);
        rotarMediaVueltaConCorreccion(dupDiagonal, boundsDiagonal);

        return {
            superiorDerecho:  dupHorizontal,
            inferiorIzquierdo: dupVertical,
            inferiorDerecho:   dupDiagonal
        };
    }

    // Público: solo lo que consumen otros módulos. duplicarHorizontal y
    // rotarMediaVueltaConCorreccion son helpers internos de duplicarEnCuadrantes.
    return {
        duplicarVertical: duplicarVertical,
        duplicarEnCuadrantes: duplicarEnCuadrantes
    };

})();
