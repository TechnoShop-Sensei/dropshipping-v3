const { Router } = require('express')
const { ordersCreateIngram, ordersUpdateIngram } = require('../controllers/orders/orders.controllers')

const router = Router();

router.post('/',  ordersCreateIngram);// Agrega Productos en Base de Datos
router.post('/update',  ordersUpdateIngram); // Agrega Productos en Base de Datos

module.exports = router;