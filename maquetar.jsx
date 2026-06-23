// ====================================================================
// CONFIGURACION
// ====================================================================

var CONFIG = {
    tolerancias: {
        horizontal: 2,
        vertical: 2
    },
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
#include "maquetar/geometria/bounds.js"
#include "maquetar/geometria/validarSuperposicion.js"
#include "maquetar/indesign/AdaptadorInDesign.jsx"
#include "maquetar/depuracion/Depuracion.jsx"
#include "maquetar/depuracion/DepuracionGeometrica.jsx"
#include "maquetar/geometria/TrazadoDeGuias.jsx"
#include "maquetar/aplicacion/ValidacionDeEjecucion.jsx"
#include "maquetar/maquetacion/RepeticionDeCuadrantes.jsx"
#include "maquetar/maquetacion/MaquetarMediaCarta.jsx"
#include "maquetar/maquetacion/MaquetarCuartoCarta.jsx"
#include "maquetar/maquetacion/MaquetacionPorCategoria.jsx"
#include "maquetar/aplicacion/PresentacionDeResultados.jsx"
#include "maquetar/aplicacion/Aplicacion.jsx"

// ====================================================================
// EJECUCION
// ====================================================================

Aplicacion.ejecutar(CONFIG);
