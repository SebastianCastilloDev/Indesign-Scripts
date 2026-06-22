// Genera dos líneas horizontales en la parte superior de la página activa
// a una distancia del borde superior, una al lado izquierdo y otra al lado derecho
// Funciona en páginas normales y páginas maestra

// --- PARÁMETROS CONFIGURABLES ---
var distanciaSuperior = 17;  // mm desde el borde superior
var longitudLinea = 7;       // mm de largo de cada línea
var grosorLinea = 0.5;       // pt de grosor
var colorLinea = "Black";    // nombre del swatch de color
// --------------------------------

if (app.documents.length > 0) {
    var doc = app.activeDocument;

    try {
        var pagina = app.activeWindow.activePage;
        if (!pagina) throw new Error();

        var bordeSuperior = pagina.bounds[0];
        var bordeIzquierdo = pagina.bounds[1];
        var bordeDerecho = pagina.bounds[3];

        var y = bordeSuperior + distanciaSuperior;

        // Línea izquierda: desde el borde izquierdo hacia la derecha
        var lineaIzq = pagina.graphicLines.add();
        lineaIzq.strokeWeight = grosorLinea;
        lineaIzq.strokeColor = doc.swatches.item(colorLinea);
        lineaIzq.paths[0].entirePath = [
            [bordeIzquierdo, y],
            [bordeIzquierdo + longitudLinea, y]
        ];

        // Línea derecha: desde el borde derecho hacia la izquierda
        var lineaDer = pagina.graphicLines.add();
        lineaDer.strokeWeight = grosorLinea;
        lineaDer.strokeColor = doc.swatches.item(colorLinea);
        lineaDer.paths[0].entirePath = [
            [bordeDerecho - longitudLinea, y],
            [bordeDerecho, y]
        ];

        alert("Listo. Se generaron dos líneas en la parte superior de la página activa.");
    } catch (e) {
        alert("No se pudo obtener la página activa. Asegúrate de tener una página seleccionada.");
    }
} else {
    alert("No hay ningún documento abierto.");
}
