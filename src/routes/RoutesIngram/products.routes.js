const { Router } = require('express')
const { productosPostBD,  productosCreateWoo, productosUpdateWoo} = require('../../controllers/products/productosControllerIngram/products.controllers')

const router = Router();



router.post('/products',  productosPostBD);// Agrega Productos Ingram en Base de Datos

router.post('/productswoo',  productosCreateWoo); // Agrega Productos en Woocomerce

router.post('/productsupdatewoo',  productosUpdateWoo); // Actualizar Titulo Productos en Woocomerce



module.exports = router;