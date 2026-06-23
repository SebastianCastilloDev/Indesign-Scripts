var SelectorDePapel = (function() {

    // Muestra un modal para elegir el papel de impresión.
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

        var opcion14 = panel.add("radiobutton", undefined, "Tamaño 14   (274 × 215.9 mm)");
        var opcionCarta = panel.add("radiobutton", undefined, "Tamaño Carta   (279.4 × 215.9 mm)");

        if (papelPorDefecto === Papeles.TAMANO_CARTA.nombre) {
            opcionCarta.value = true;
        } else {
            opcion14.value = true;
        }

        var botones = dialogo.add("group");
        botones.alignment = "right";
        botones.add("button", undefined, "Cancelar", { name: "cancel" });
        botones.add("button", undefined, "Maquetar", { name: "ok" });

        if (dialogo.show() !== 1) {
            return null;
        }

        return opcion14.value ? Papeles.TAMANO_14 : Papeles.TAMANO_CARTA;
    }

    return {
        elegir: elegir
    };

})();
