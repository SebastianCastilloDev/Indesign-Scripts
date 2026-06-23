// ====================================================================
// CONFIGURACION
// ====================================================================

var CONFIG = {
    tolerancias: {
        horizontal: 2,
        vertical: 2
    },
    papelPorDefecto: "Tamaño 14",  // preselección del modal (el más común)
    depuracion: {
        detallada: false,  // true → registra detalles geométricos internos
        mostrar: false     // true → crea el recuadro de log al finalizar
    }
};

// ====================================================================
// MODULOS
// ====================================================================

#include "maquetar/unidades/Unidades.jsx"
#include "maquetar/formatos/CatalogoDeFormatos.jsx"
#include "maquetar/formatos/ClasificacionDeFormato.jsx"
#include "maquetar/formatos/papeles.js"
#include "maquetar/geometria/bounds.js"
#include "maquetar/geometria/validarSuperposicion.js"
#include "maquetar/indesign/AdaptadorInDesign.jsx"
#include "maquetar/depuracion/Depuracion.jsx"
#include "maquetar/depuracion/DepuracionGeometrica.jsx"
#include "maquetar/geometria/TrazadoDeGuias.jsx"
#include "maquetar/aplicacion/ValidacionDeEjecucion.jsx"
#include "maquetar/maquetacion/RepeticionDeCuadrantes.jsx"
#include "maquetar/maquetacion/MaquetarCompleto.jsx"
#include "maquetar/maquetacion/MaquetarMedia.jsx"
#include "maquetar/maquetacion/MaquetarCuarto.jsx"
#include "maquetar/maquetacion/MaquetacionPorCategoria.jsx"
#include "maquetar/ui/SelectorDePapel.jsx"
#include "maquetar/aplicacion/PresentacionDeResultados.jsx"
#include "maquetar/aplicacion/Aplicacion.jsx"

// ====================================================================
// EJECUCION
// ====================================================================

Aplicacion.ejecutar(CONFIG);
