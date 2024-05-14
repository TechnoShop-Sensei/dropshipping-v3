const { response, request } = require('express');
const pool = require('../../../database/conexion');

const productClass = require('../../../modules/ProductosModule/ProductosIngram/postProductos.modules')
const productWoo = require('../../../modules/ProductosModule/ProductosIngram/createProductosWoo.modules')

const productInsertBD = new productClass(pool)
const productActionWoo = new productWoo(pool) 

  // ? Agregando Productos a BD solo seleccionados desde Categorias y Marcas
  const productosPostBD = async(req = request, res = response) => {
    productInsertBD.agregarProductosBD()
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

  // ? Agregando Productos a Woocomerce
  const productosCreateWoo = async(req = request, res = response) => {
    productActionWoo.agregarProductosWoo()
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

  // ? Actualizar Titulo de Productos a Woocomerce
  const productosUpdateWoo = async(req = request, res = response) => {
    productActionWoo.UpdateProductTituloWoo()
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
  productosCreateWoo,
  productosUpdateWoo
}