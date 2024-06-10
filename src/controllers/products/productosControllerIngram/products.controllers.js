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
  // TODO: Se agregan productos nuevos cada viernes a las 12:00pm
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

  //* METODOS DE ACTUALIZAR PRECIOS Y STOCK

  // ? Actualizar Precios y Stock en la Base de Datos
  // TODO: Actualizar datos dentro de ingramProductosv2 de 50 en 50
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
    })
  }

  // ? Actualizar Precios y Stock en la Woocommerce
  // TODO: Actualizar datos dentro de Woocommerce de 100 en 100
  const productosPricesandStockWoo = async(req = request, res = response) => {
    productPriceStock.UpdateProductPricesAndStockWoo()
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

  //* METODOS DE ACTUALIZAR CUALQUIER DETALLE All
  
  // ? Actualizar categorias de los productos de Woocommerce editados desde BD
  // TODO: Actualizar datos dentro de Woocommerce de 100 en 100
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

  // ? Actualizar Titulos de los productos de Woocommerce editados desde BD
  // TODO: Actualiza si contiene Nombre Optimatizado de 100 en 100
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

  //* Solo para DATOS GENERALES, detalles de produccion

  // ? Actualiza el ID de Woocommerce que sea igual al Nombre de Categorias de Productos BD
  const productosUpdateIDCategoriasBD = async(req = request, res = response) => {
    productUpdateAll.updateWooCommerceIDs()
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

   // ? Actualiza el ID de Woocommerce que sea igual al Nombre de Categorias de Productos BD
   const productosUpdateCategoriasAndSubcategoriasNew = async(req = request, res = response) => {
    productUpdateAll.actualizarCategorias()
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

  productosPricesandStock,
  productosPricesandStockWoo,
//? Actualizadores
  productosUpdateCategorias,
  productosUpdateTitleWoo,
  productosUpdateIDCategoriasBD,
  productosUpdateCategoriasAndSubcategoriasNew
}