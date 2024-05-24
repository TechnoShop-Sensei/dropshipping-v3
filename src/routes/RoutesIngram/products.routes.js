const { Router } = require('express')
const { productosPostBD,  productosCreateWoo, productosPricesandStock, productosPricesandStockWoo, productosUpdateCategorias, productosUpdateTitleWoo} = require('../../controllers/products/productosControllerIngram/products.controllers')

const router = Router();


router.post('/products',  productosPostBD);// Agrega Productos Ingram en Base de Datos
router.post('/productswoo',  productosCreateWoo); // Agrega Productos en Woocomerce


//? Prices and Stock Update
router.post('/pricesandstockUpdate',  productosPricesandStock); // Actualizar Titulo Productos en Woocomerce
router.post('/pricesandstockUpdatewoo', productosPricesandStockWoo);

//? Actualizador de Productos

router.post('/productosCategoriasUpdate', productosUpdateCategorias)
router.post('/productostitulosUpdate', productosUpdateTitleWoo)

module.exports = router;