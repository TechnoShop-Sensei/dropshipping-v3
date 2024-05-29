const { Router } = require('express');
const { CrearOActualizarColores, AgregarColorAProduct, ActualizarFiltros } = require('../../controllers/Filtros/FiltrosControllerIngram/Filtro.controller');


const router = Router();

// * Filtros para Colores
router.get('/filtrosCreateandUpdate', CrearOActualizarColores);
router.get('/filtrosProductColores',AgregarColorAProduct );

//* Se debe editar antes de Correr, ya que borra los atributos anteriores
router.get('/filtrosUpdateWoo', ActualizarFiltros)

module.exports = router;