const { Router } = require('express');
const { ActualizarFiltrosAll, CrearOActualizarColoresWoo, AgregarColorAProductBD, CrearOActualizarPulgadasWoo, AgregarPulgasAProductosBD,
    CrearOActualizarHerztWoo, AgregarHerztAProductosBD
 } = require('../../controllers/Filtros/FiltrosControllerIngram/Filtro.controller');


const router = Router();

// ? Filtros para Colores
router.get('/filtrosCreateandUpdateColores', CrearOActualizarColoresWoo);
router.get('/filtrosProductColores',AgregarColorAProductBD );

// ? Filtros para Pulgadas
router.get('/filtrosCreateandUpdatePulgadas', CrearOActualizarPulgadasWoo);
router.get('/filtrosProductPulgadas', AgregarPulgasAProductosBD);

// ? Filtros para Herzt
router.get('/filtrosCreateandUpdateHerzt', CrearOActualizarHerztWoo);
router.get('/filtrosProductHerzt', AgregarHerztAProductosBD);


// ? Filtros para Resoluciones
router.get('/filtrosCreateandUpdateResolucion', );
router.get('/filtrosProductResolucion', );


//* Se debe editar antes de Correr, ya que borra los atributos anteriores
router.get('/filtrosUpdateWoo', ActualizarFiltrosAll)

module.exports = router;