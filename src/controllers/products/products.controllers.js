const { response, request } = require('express');
const postProducts = require('../../modules/products/postProductos.modules');
const PutProducts = require('../../modules/products/putProducts.modules');
const pool = require('../../database/conexion');
const postproductosClass = new postProducts(pool);
const putProductsClass = new PutProducts();

  const productosPostBD = async(req = request, res = response) => {
    postproductosClass.agregarProductosBD()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Marcas a la Base de Datos',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }


  const productosPostWoo = async(req = request, res = response) => {
    postproductosClass.agregarProductosWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Productos a Woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

module.exports = {
  productosPostBD,
  productosPostWoo
}