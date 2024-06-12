const { Router } = require('express')
const { productosPostBD,  productosCreateWoo, productosPricesandStock, productosPricesandStockWoo, productosUpdateCategorias, productosUpdateTitleWoo, productosUpdateIDCategoriasBD, productosUpdateCategoriasAndSubcategoriasNew} = require('../../controllers/products/productosControllerIngram/products.controllers')

const router = Router();


router.post('/products',  productosPostBD);// Agrega Productos Ingram en Base de Datos
router.post('/productswoo',  productosCreateWoo); // Agrega Productos en Woocomerce


//? Prices and Stock Update
router.post('/pricesandstockUpdate',  productosPricesandStock); // Actualizar Precios de Productos en BD
router.post('/pricesandstockUpdatewoo', productosPricesandStockWoo);// Actualizar Precios de Productos en Woocomerce


//? Actualizador de Productos
router.post('/productosCategoriasUpdate', productosUpdateCategorias)// Actualizar Categorias en General a Productos en Woocomerce
router.post('/productostitulosUpdate', productosUpdateTitleWoo)// Actualizar Titulos a Productos en Woocomerce


// ? Se ejecuto 1 vez
router.post('/productosIdCategoriasUpdatewoo', productosUpdateIDCategoriasBD) // Actualizar Id Categorias en General a Categorias en BD
router.post('/productosCategoriasNewBD', productosUpdateCategoriasAndSubcategoriasNew) // Actualiza el id_categoria y id_Subcategoria de productos en BD

module.exports = router;