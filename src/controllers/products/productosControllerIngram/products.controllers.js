const { response, request } = require('express');
const pool = require('../../../database/conexion');

const productClass = require('../../../modules/ProductosModule/ProductosIngram/postProductos.modules')
const productWoo = require('../../../modules/ProductosModule/ProductosIngram/createProductosWoo.modules')
const productPrice = require('../../../modules/ProductosModule/ProductosIngram/putProducts.modules')
const productUpdate = require('../../../modules/ProductosModule/ProductosIngram/updateProductos.modules')

const productInsertBD = new productClass(pool)
const productActionWoo = new productWoo(pool) 
const productPriceStock = new productPrice(pool)
const productUpdateAll = new productUpdate(pool)

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

  //* METODOS DE ACTUALIZAR PRECIOS Y STOCK
  const productosPricesandStock = async(req = request, res = response) => {
    productPriceStock.UpdateProductPricesBD()
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

  const productosPricesandStockWoo = async(req = request, res = response) => {
    productPriceStock.UpdateProductPricesAndSockWoo()
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

  //* METODOS DE ACTUALIZAR All
  
  const productosUpdateCategorias = async(req = request, res = response) => {
    productUpdateAll.UpdateProductCategoriasWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Actualizando Categorias de Productos a Woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

  const productosUpdateTitleWoo = async(req = request, res = response) => {
    productUpdateAll.ActualizarTitulosAWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Actualizando Titulos de Productos a Woocommerce',
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
  productosUpdateWoo,

  productosPricesandStock,
  productosPricesandStockWoo,
//? Actualizadores
  productosUpdateCategorias,
  productosUpdateTitleWoo
}