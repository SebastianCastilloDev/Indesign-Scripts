
main();
function main() {
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	var archivoPDF = File.openDialog("Elige un archivo PDF");
	if ((archivoPDF != "") && (archivoPDF != null)) {
		var documento, pagina;
		if (app.documents.length != 0) {
			var temp = elegirDocumento();
			documento = temp[0];
			nuevoDocumento = temp[1];
		}
		else {
			documento = app.documents.add();
			nuevoDocumento = false;
		}

		alert(documento.constructor.name);
		if (nuevoDocumento == false) {
			pagina = elegirPagina(documento);
		}
		else {
			pagina = documento.pages.item(0);
		}
		colocarPDF(documento, pagina, archivoPDF);
	}
}
function elegirDocumento() {
	var nombresDocumentos = new Array;
	nombresDocumentos.push("Nuevo Documento");
	for (var contadorDocumento = 0; contadorDocumento < app.documents.length; contadorDocumento++) {
		nombresDocumentos.push(app.documents.item(contadorDocumento).name);
	}
	var dialogoElegirDocumento = app.dialogs.add({ name: "Elige un documento", canCancel: false });
	with (dialogoElegirDocumento.dialogColumns.add()) {
		with (dialogRows.add()) {
			with (dialogColumns.add()) {
				staticTexts.add({ staticLabel: "Colocar PDF en:" });
			}
			with (dialogColumns.add()) {
				var desplegableElegirDocumento = dropdowns.add({ stringList: nombresDocumentos, selectedIndex: 0 });
			}
		}
	}
	var resultado = dialogoElegirDocumento.show();
	if (resultado == true) {
		if (desplegableElegirDocumento.selectedIndex == 0) {
			documento = app.documents.add();
			nuevoDocumento = true;
		}
		else {
			documento = app.documents.item(desplegableElegirDocumento.selectedIndex - 1);
			nuevoDocumento = false;
		}
		dialogoElegirDocumento.destroy();
	}
	else {
		documento = "";
		nuevoDocumento = "";
		dialogoElegirDocumento.destroy();
	}
	return [documento, nuevoDocumento];
}
function elegirPagina(documento) {
	alert(documento.name);
	var nombresPaginas = new Array;
	for (var contador = 0; contador < documento.pages.length; contador++) {
		nombresPaginas.push(documento.pages.item(contador).name);
	}
	var dialogoElegirPagina = app.dialogs.add({ name: "Elige una página", canCancel: false });
	with (dialogoElegirPagina.dialogColumns.add()) {
		with (dialogRows.add()) {
			with (dialogColumns.add()) {
				staticTexts.add({ staticLabel: "Colocar PDF en:" });
			}
			with (dialogColumns.add()) {
				var desplegableElegirPagina = dropdowns.add({ stringList: nombresPaginas, selectedIndex: 0 });
			}
		}
	}

	dialogoElegirPagina.show();
	var pagina = documento.pages.item(desplegableElegirPagina.selectedIndex);

	dialogoElegirPagina.destroy();
	return pagina;
}
function colocarPDF(documento, pagina, archivoPDF) {
	app.pdfPlacePreferences.pdfCrop = PDFCrop.cropMedia;
	var columnas = 2;
	var filas = 4;
	var elementosPorPagina = columnas * filas;
	var anchoPagina = documento.documentPreferences.pageWidth;
	var altoPagina = documento.documentPreferences.pageHeight;
	var anchoElemento = anchoPagina / columnas;
	var altoElemento = altoPagina / filas;

	function colocarUnaPagina(paginaActual, numeroPaginaPDF, contadorElementos, invertirVerticalmente) {
		app.pdfPlacePreferences.pageNumber = numeroPaginaPDF;
		var paginaPDF;
		try {
			paginaPDF = paginaActual.place(File(archivoPDF), [0, 0])[0];
		} catch (e) {
			return false;
		}
		if (paginaPDF.pdfAttributes.pageNumber != numeroPaginaPDF) {
			paginaPDF.parent.remove();
			return false;
		}
		var fila;
		var columna = contadorElementos % columnas;
		if (invertirVerticalmente) {
			fila = (filas - 1) - Math.floor(contadorElementos / columnas);
		} else {
			fila = Math.floor(contadorElementos / columnas);
		}
		var x = columna * anchoElemento;
		var y = fila * altoElemento;
		var marco = paginaPDF.parent;
		marco.move([x, y]);
		marco.rotationAngle = 90;
		marco.geometricBounds = [y, x, y + altoElemento, x + anchoElemento];
		marco.fit(FitOptions.PROPORTIONALLY);
		return true;
	}

	var paginaActual = pagina;
	var contadorCiclos = 0;
	var seguirImportando = true;

	// Establecer márgenes para la primera página
	var marginPrefs = paginaActual.marginPreferences;
	marginPrefs.top = 0; marginPrefs.bottom = 0; marginPrefs.left = 0; marginPrefs.right = 0;

	while (seguirImportando) {
		var paginasImparesColocadas = 0;

		// --- Página de IMPARES ---
		if (contadorCiclos > 0) {
			paginaActual = documento.pages.add(LocationOptions.after, paginaActual);
			var marginPrefsImpar = paginaActual.marginPreferences;
			marginPrefsImpar.top = 0; marginPrefsImpar.bottom = 0; marginPrefsImpar.left = 0; marginPrefsImpar.right = 0;
		}

		for (var i = 0; i < elementosPorPagina; i++) {
			var numPaginaImpar = (contadorCiclos * elementosPorPagina * 2) + (i * 2) + 1;
			if (colocarUnaPagina(paginaActual, numPaginaImpar, i, false)) {
				paginasImparesColocadas++;
			} else {
				seguirImportando = false;
				break;
			}
		}

		// Si no se colocó ninguna página impar, significa que terminamos.
		// Si la página actual está vacía (porque se creó en una nueva iteración), se elimina.
		if (paginasImparesColocadas === 0) {
			if (paginaActual.allPageItems.length === 0 && contadorCiclos > 0) {
				paginaActual.remove();
			}
			break; // Salir del bucle principal
		}

		// --- Página de PARES ---
		var paginaPar = documento.pages.add(LocationOptions.after, paginaActual);
		var marginPrefsPar = paginaPar.marginPreferences;
		marginPrefsPar.top = 0; marginPrefsPar.bottom = 0; marginPrefsPar.left = 0; marginPrefsPar.right = 0;
		var paginasParesColocadas = 0;

		for (var j = 0; j < elementosPorPagina; j++) {
			var numPaginaPar = (contadorCiclos * elementosPorPagina * 2) + (j * 2) + 2;
			if (colocarUnaPagina(paginaPar, numPaginaPar, j, true)) {
				paginasParesColocadas++;
			} else {
				seguirImportando = false;
				break;
			}
		}

		if (paginasParesColocadas === 0) {
			paginaPar.remove();
		}

		paginaActual = paginaPar; // La siguiente página se creará después de la de los pares.
		contadorCiclos++;
	}
}
// Llamar a la función principal
main();