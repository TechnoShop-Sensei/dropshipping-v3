const { response, request } = require('express');
const postCategorias = require('../../modules/categorias/postCategories.modules');

const pool = require('../../database/conexion');
const categoriasClass = new postCategorias(pool);


// ? Agregando Categorias de Ingram en la base de datos
const categoriasPost = async (req = request, res = response) => {

    categoriasClass.ejecutar()
        .then(msg => {
            console.log(msg);
            res.status(201).json({
                  mensaje: 'Post Api - Agregando Categorias a la Base de Datos',
                  datos: msg
              })
        })
        .catch(error => {
            console.error(error);
        });
  }

  
// ? Agregando Categorias de Ingram a Woocommerce
const categoriasPostWoo = async (req = request, res = response) => {

  const ver = await categoriasClass.postCategoriasWoo();

    res.status(201).json({
        msg: 'Post Api - Agregar Productos a Woocommerce',
        data: ver
    })
  }

// ? Actualizar Categorias Ingram, Agrendo Dependencias de Categoria Hijo y Categoria Padre
const categoriasPutBD = async(req = request, res = response) => {

    const ver = await categoriasClass.updateCategoriaParentBD();

    res.status(201).json({
        msg: 'Post Api - Update Parent Category en Base de Datos',
        data: ver
    })
  }

// ? Actualizar Categorias Ingram en Woocommerce
const categoriasPutWoo = async(req = request, res = response) => {

    const ver = await categoriasClass.updateCategoriaParentWoo();

    res.json({
        msg: 'Post Api - Update Parent Category en WooCommerce',
        data: ver
    })
  }

  const categoriasGeneralesBD = async(req = request, res = response) => {

    const ver = await categoriasClass.categoriasSeleccionadas();

    res.json({
        msg: 'Post Api - Update Categorias Generales en BD',
        data: ver
    })
  }


module.exports = {
    categoriasPost,
    categoriasPostWoo,
    categoriasPutBD,
    categoriasPutWoo,
    categoriasGeneralesBD
}