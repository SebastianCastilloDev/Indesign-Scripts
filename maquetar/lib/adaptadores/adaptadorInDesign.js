var AdaptadorInDesign = (function() {

    function obtenerOrientacionHorizontal() {
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.HORIZONTAL !== undefined) return HorizontalOrVertical.HORIZONTAL;
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.horizontal !== undefined) return HorizontalOrVertical.horizontal;
        return 1752332916;
    }

    function obtenerOrientacionVertical() {
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.VERTICAL !== undefined) return HorizontalOrVertical.VERTICAL;
        if (typeof HorizontalOrVertical !== "undefined" && HorizontalOrVertical.vertical !== undefined) return HorizontalOrVertical.vertical;
        return 1986359924;
    }

    return {
        obtenerOrientacionHorizontal: obtenerOrientacionHorizontal,
        obtenerOrientacionVertical: obtenerOrientacionVertical
    };

})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = AdaptadorInDesign;
}
