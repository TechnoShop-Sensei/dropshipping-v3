const { Router } = require('express')
const { schedule } = require('node-cron')
const { productosPostBD, productosPostWoo } = require('../controllers/products/products.controllers')

const router = Router();



router.post('/products',  productosPostBD);// Agrega Productos Ingram en Base de Datos

router.post('/productswoo',  productosPostWoo); // Agrega Productos en Woocomerce



module.exports = router;