var RepeticionDeCuadrantes = (function() {

    function copiarBounds(bounds) {
        return [bounds[0], bounds[1], bounds[2], bounds[3]];
    }

    function registrarDuplicacion(etiqueta, pagina, obj, centroNombre, centro, posicionNombre, posicion, deltaNombre, delta) {
        var bounds = obj.geometricBounds;
        Depuracion.registrar("  DEBUG " + etiqueta + ":");
        Depuracion.registrar("    page bounds: [" + pagina.bounds.join(", ") + "]");
        Depuracion.registrar("    " + centroNombre + ": " + centro);
        Depuracion.registrar("    obj bounds: [" + bounds.join(", ") + "]");
        Depuracion.registrar("    " + posicionNombre + ": " + posicion);
        Depuracion.registrar("    " + deltaNombre + ": " + delta);
    }

    function registrarDuplicadoMovido(etiquetaCentro, dup, indiceA, indiceB) {
        var bounds = dup.geometricBounds;
        Depuracion.registrar("    dup bounds despues de mover: [" + bounds.join(", ") + "]");
        Depuracion.registrar("    nuevo " + etiquetaCentro + ": " + ((bounds[indiceA] + bounds[indiceB]) / 2));
    }

    function duplicarHorizontal(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroX = (pBounds[1] + pBounds[3]) / 2;
        var bounds = obj.geometricBounds;
        var nuevoLeft = 2 * centroX - bounds[3];
        var deltaX = nuevoLeft - bounds[1];

        registrarDuplicacion("duplicarHorizontal", pagina, obj, "centroX", centroX, "nuevoLeft", nuevoLeft, "deltaX", deltaX);

        var dup = obj.duplicate();
        dup.move(undefined, [deltaX, 0]);
        registrarDuplicadoMovido("centroElementoX", dup, 1, 3);

        return dup;
    }

    function duplicarVertical(obj, pagina) {
        var pBounds = pagina.bounds;
        var centroY = (pBounds[0] + pBounds[2]) / 2;
        var bounds = obj.geometricBounds;
        var nuevoTop = 2 * centroY - bounds[2];
        var deltaY = nuevoTop - bounds[0];

        registrarDuplicacion("duplicarVertical", pagina, obj, "centroY", centroY, "nuevoTop", nuevoTop, "deltaY", deltaY);

        var dup = obj.duplicate();
        dup.move(undefined, [0, deltaY]);
        registrarDuplicadoMovido("centroElementoY", dup, 0, 2);

        return dup;
    }

    function rotarMediaVueltaConCorreccion(obj, boundsObjetivo) {
        var anguloActual = typeof obj.rotationAngle === "number" ? obj.rotationAngle : 0;
        Depuracion.registrar("  DEBUG rotarMediaVuelta:");
        Depuracion.registrar("    angulo antes: " + anguloActual);
        Depuracion.registrar("    bounds objetivo: [" + boundsObjetivo.join(", ") + "]");
        DepuracionGeometrica.registrarBounds("antes de rotar", obj);

        obj.rotationAngle = anguloActual + 180;

        Depuracion.registrar("    angulo despues: " + obj.rotationAngle);
        DepuracionGeometrica.registrarBounds("despues de rotar", obj);

        var boundsDespues = obj.geometricBounds;
        var deltaX = boundsObjetivo[1] - boundsDespues[1];
        var deltaY = boundsObjetivo[0] - boundsDespues[0];
        Depuracion.registrar("    delta correccion post-rotacion: [" + deltaX + ", " + deltaY + "]");
        obj.move(undefined, [deltaX, deltaY]);

        DepuracionGeometrica.registrarBounds("despues de corregir posicion", obj);
        DepuracionGeometrica.registrarElementosInternos("despues de rotar", obj);
        return obj;
    }

    function duplicarEnCuadrantes(obj, pagina) {
        Depuracion.registrar("  DEBUG objeto base antes de duplicar:");
        DepuracionGeometrica.registrarBounds("base", obj);
        DepuracionGeometrica.registrarElementosInternos("base", obj);

        var dupHorizontal = duplicarHorizontal(obj, pagina);
        var dupVertical = duplicarVertical(obj, pagina);
        var dupDiagonal = duplicarVertical(dupHorizontal, pagina);
        var boundsVertical = copiarBounds(dupVertical.geometricBounds);
        var boundsDiagonal = copiarBounds(dupDiagonal.geometricBounds);

        rotarMediaVueltaConCorreccion(dupVertical, boundsVertical);
        rotarMediaVueltaConCorreccion(dupDiagonal, boundsDiagonal);

        return {
            superiorDerecho: dupHorizontal,
            inferiorIzquierdo: dupVertical,
            inferiorDerecho: dupDiagonal
        };
    }

    return {
        duplicarHorizontal: duplicarHorizontal,
        duplicarVertical: duplicarVertical,
        duplicarEnCuadrantes: duplicarEnCuadrantes,
        rotarMediaVueltaConCorreccion: rotarMediaVueltaConCorreccion
    };

})();
