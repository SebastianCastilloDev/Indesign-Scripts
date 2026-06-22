// --- CONFIGURACIÓN ---
var CONFIG = {
    toleranciaHorizontal: 2,
    toleranciaVertical: 2,
    tamanos: [
        { nombre: "Carta",        ancho: 215.9,  alto: 279.4 },
        { nombre: "Media Carta",  ancho: 139.7,  alto: 215.9 },
        { nombre: "Cuarto Carta", ancho: 107.95, alto: 139.7 }
    ]
};

// --- UTILIDADES ---
function area(ancho, alto) {
    return ancho * alto;
}

function obtenerDimensiones(obj) {
    var bounds = obj.geometricBounds;
    return {
        ancho: Math.abs(bounds[3] - bounds[1]),
        alto: Math.abs(bounds[2] - bounds[0])
    };
}

function cabeDentro(ancho, alto, refAncho, refAlto, tolH, tolV) {
    return (ancho <= refAncho + tolH && alto <= refAlto + tolV);
}

// --- CLASIFICADOR ---
function clasificar(ancho, alto, config) {
    var mejor = null;
    var menorArea = Infinity;

    for (var i = 0; i < config.tamanos.length; i++) {
        var t = config.tamanos[i];
        var areaRef = area(t.ancho, t.alto);

        if (cabeDentro(ancho, alto, t.ancho, t.alto, config.toleranciaHorizontal, config.toleranciaVertical) ||
            cabeDentro(ancho, alto, t.alto, t.ancho, config.toleranciaHorizontal, config.toleranciaVertical)) {
            if (areaRef < menorArea) {
                menorArea = areaRef;
                mejor = t.nombre;
            }
        }
    }
    return mejor;
}

// --- ORQUESTADOR ---
function ejecutar(config) {
    if (app.documents.length === 0) {
        alert("No hay ningún documento abierto.");
        return;
    }

    var sel = app.selection;
    if (sel.length === 0) {
        alert("No hay ningún elemento seleccionado.");
        return;
    }

    var resultados = [];
    for (var j = 0; j < sel.length; j++) {
        var dim = obtenerDimensiones(sel[j]);
        var nombre = clasificar(dim.ancho, dim.alto, config);
        var linea = "Elemento " + (j + 1) + ": ";
        if (nombre) {
            linea += nombre;
        } else {
            linea += "Sin categoría";
        }
        linea += " (" + dim.ancho.toFixed(2) + " x " + dim.alto.toFixed(2) + ")";
        resultados.push(linea);
    }

    alert(resultados.join("\n"));
}

// --- ENTRY POINT ---
ejecutar(CONFIG);
