// --- CONFIGURACIÓN ---

var CARTA = {
    nombre: "Carta",
    ancho: 215.9,
    alto: 279.4
};

function calcularMediaCarta() {
    return {
        nombre: "Media Carta",
        ancho: CARTA.alto / 2,
        alto: CARTA.ancho
    };
}

function calcularCuartoCarta() {
    return {
        nombre: "Cuarto Carta",
        ancho: CARTA.ancho / 2,
        alto: CARTA.alto / 2
    };
}

var MEDIA_CARTA = calcularMediaCarta();
var CUARTO_CARTA = calcularCuartoCarta();

var CONFIG = {
    toleranciaHorizontal: 2,
    toleranciaVertical: 2,
    tamanos: [
        CARTA,
        MEDIA_CARTA,
        CUARTO_CARTA
    ]
};

// --- UTILIDADES ---

function calcularArea(ancho, alto) {
    return ancho * alto;
}

function medirElemento(obj) {
    var bounds = obj.geometricBounds;
    return {
        ancho: Math.abs(bounds[3] - bounds[1]),
        alto: Math.abs(bounds[2] - bounds[0])
    };
}

function cabeEnDimension(ancho, alto, refAncho, refAlto, tolH, tolV) {
    return (ancho <= refAncho + tolH && alto <= refAlto + tolV);
}

// --- CLASIFICADOR ---

function determinarTamanio(ancho, alto, config) {
    var mejor = null;
    var menorArea = Infinity;

    for (var i = 0; i < config.tamanos.length; i++) {
        var t = config.tamanos[i];
        var areaRef = calcularArea(t.ancho, t.alto);

        var entraDirecto = cabeEnDimension(ancho, alto, t.ancho, t.alto, config.toleranciaHorizontal, config.toleranciaVertical);
        var entraRotado = cabeEnDimension(ancho, alto, t.alto, t.ancho, config.toleranciaHorizontal, config.toleranciaVertical);

        if (entraDirecto || entraRotado) {
            if (areaRef < menorArea) {
                menorArea = areaRef;
                mejor = t.nombre;
            }
        }
    }
    return mejor;
}

// --- VALIDACIONES ---

function hayDocumentoAbierto() {
    return app.documents.length > 0;
}

function hayElementosSeleccionados() {
    return app.selection.length > 0;
}

function obtenerSeleccionActual() {
    return app.selection;
}

// --- CONSTRUCCIÓN DE RESULTADOS ---

function clasificarElementos(elementos, config) {
    var resultados = [];
    for (var i = 0; i < elementos.length; i++) {
        var dim = medirElemento(elementos[i]);
        var categoria = determinarTamanio(dim.ancho, dim.alto, config);
        resultados.push({
            indice: i + 1,
            categoria: categoria || "Sin categoría",
            ancho: dim.ancho,
            alto: dim.alto
        });
    }
    return resultados;
}

function formatearResultados(resultados) {
    var lineas = [];
    for (var i = 0; i < resultados.length; i++) {
        var r = resultados[i];
        lineas.push("Elemento " + r.indice + ": " + r.categoria + " (" + r.ancho.toFixed(2) + " x " + r.alto.toFixed(2) + ")");
    }
    return lineas.join("\n");
}

function mostrarMensaje(mensaje) {
    alert(mensaje);
}

// --- ORQUESTADOR ---

function ejecutar(config) {
    if (!hayDocumentoAbierto()) {
        mostrarMensaje("No hay ningún documento abierto.");
        return;
    }

    if (!hayElementosSeleccionados()) {
        mostrarMensaje("No hay ningún elemento seleccionado.");
        return;
    }

    var seleccion = obtenerSeleccionActual();
    var resultadosClasificados = clasificarElementos(seleccion, config);
    var mensaje = formatearResultados(resultadosClasificados);

    mostrarMensaje(mensaje);
}

// --- ENTRY POINT ---
ejecutar(CONFIG);
