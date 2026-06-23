var SelectorDePapel = (function() {

    // Muestra un modal para elegir el papel de impresión. Se arma dinámicamente
    // desde Papeles.todos(), así que agregar un papel no requiere tocar este archivo.
    // Devuelve el papel elegido (Papeles.TAMANO_*) o null si se cancela.
    function elegir(papelPorDefecto) {
        var dialogo = new Window("dialog", "Maquetar");
        dialogo.alignChildren = "fill";
        dialogo.margins = 16;
        dialogo.spacing = 12;

        var panel = dialogo.add("panel", undefined, "Formato de impresión");
        panel.alignChildren = "left";
        panel.margins = 16;
        panel.spacing = 8;

        var papeles = Papeles.todos();
        var radios = [];
        for (var i = 0; i < papeles.length; i++) {
            var p = papeles[i];
            var radio = panel.add("radiobutton", undefined, p.nombre + "   (" + p.ancho + " × " + p.alto + " mm)");
            radio.papel = p;
            if (p.nombre === papelPorDefecto) radio.value = true;
            radios.push(radio);
        }

        // Garantizar una preselección si el papel por defecto no coincidió.
        var haySeleccion = false;
        for (var j = 0; j < radios.length; j++) {
            if (radios[j].value) { haySeleccion = true; break; }
        }
        if (!haySeleccion && radios.length > 0) {
            radios[0].value = true;
        }

        var botones = dialogo.add("group");
        botones.alignment = "right";
        botones.add("button", undefined, "Cancelar", { name: "cancel" });
        botones.add("button", undefined, "Maquetar", { name: "ok" });

        if (dialogo.show() !== 1) {
            return null;
        }

        for (var k = 0; k < radios.length; k++) {
            if (radios[k].value) return radios[k].papel;
        }
        return null;
    }

    return {
        elegir: elegir
    };

})();
