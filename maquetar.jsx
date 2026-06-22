// ====================================================================
// CONFIGURACION
// ====================================================================

var CONFIG = {
    tolerancias: {
        horizontal: 2,
        vertical: 2
    },
    depuracion: {
        detallada: false
    }
};

// ====================================================================
// MODULOS
// ====================================================================

#include "maquetar/Unidades.jsx"
#include "maquetar/CalculoDeMedidas.jsx"
#include "maquetar/ClasificacionDeFormato.jsx"
#include "maquetar/lib/geometria/validarSuperposicion.js"
#include "maquetar/AdaptadorInDesign.jsx"
#include "maquetar/Depuracion.jsx"
#include "maquetar/DepuracionGeometrica.jsx"
#include "maquetar/TrazadoDeGuias.jsx"
#include "maquetar/ValidacionDeEjecucion.jsx"
#include "maquetar/RepeticionDeCuadrantes.jsx"
#include "maquetar/maquetarDocumentoParaImpresion.jsx"
#include "maquetar/MaquetacionPorCategoria.jsx"
#include "maquetar/PresentacionDeResultados.jsx"
#include "maquetar/Aplicacion.jsx"

// ====================================================================
// EJECUCION
// ====================================================================

Aplicacion.ejecutar(CONFIG);
