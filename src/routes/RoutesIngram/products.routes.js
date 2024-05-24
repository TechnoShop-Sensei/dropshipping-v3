const { Router } = require('express')
const { productosPostBD,  productosCreateWoo, productosUpdateWoo, productosPricesandStock, productosPricesandStockWoo, productosUpdateCategorias} = require('../../controllers/products/productosControllerIngram/products.controllers')

const router = Router();


router.post('/products',  productosPostBD);// Agrega Productos Ingram en Base de Datos
router.post('/productswoo',  productosCreateWoo); // Agrega Productos en Woocomerce
router.post('/productsupdatewoo',  productosUpdateWoo); // Actualizar Titulo Productos en Woocomerce


//? Prices and Stock Update
router.post('/pricesandstockUpdate',  productosPricesandStock); // Actualizar Titulo Productos en Woocomerce

router.post('/pricesandstockUpdatewoo', productosPricesandStockWoo);

//? Actualizador de Productos

router.post('/productosCategoriasUpdate', productosUpdateCategorias)

module.exports = router;