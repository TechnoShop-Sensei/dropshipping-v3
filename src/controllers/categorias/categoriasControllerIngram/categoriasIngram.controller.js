const { response, request } = require('express');
const pool = require('../../../database/conexion');


const postCategorias = require('../../../modules/CategoriasModule/CategoriasIngram/createCategories.modules');
const postCategoriasIdentify = require('../../../modules/CategoriasModule/CategoriasIngram/createCategoriesIdentify.modules');
const postCategoriasParents = require('../../../modules/CategoriasModule/CategoriasIngram/createCategoriesParent.modules')
const putAndAddWooCategorias = require('../../../modules/CategoriasModule/CategoriasIngram/createCategoriesWoo.modules')

const categoriasBD = new postCategorias(pool);
const categoriasBDIndentify = new postCategoriasIdentify(pool);
const categoriasBDIParent = new postCategoriasParents(pool)
const categoriasBDIWoo = new putAndAddWooCategorias(pool)


// ? Almacenar Categorias Seleccionadas de Ingram en BD
const categoriasPostBD = async (req = request, res = response) => {

    categoriasBD.ejecutar()
        .then(msg => {
            console.log(msg);
            res.status(201).json({
                  mensaje: 'Post Api - Agregando Categorias seleccionadas a la Base de Datos',
                  datos: msg
              })
        })
        .catch(error => {
            console.error(error);
        });
  }

  
// ? Almacenar Marcas con Identificador especial para Ingram en BD
const categoriasPostBDIdentify = async (req = request, res = response) => {

    categoriasBDIndentify.createCategoriasIdentifyBDI()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Categorias a la Base de Datos con el Indentificador',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

// ? Agregando mis categorias Principales con Identificador en BD
const categoriasPostIdentifyPrincipales = async(req = request, res = response) => {

    categoriasBDIndentify.createCategoriasPrincipales()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Categorias a la Base de Datos con el Indentificador',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

// ? Agregando Parent de id_Woocommerce en categorias BDI
const categoriasPostParentCategoria = async(req = request, res = response) => {

    categoriasBDIParent.updateWooCommerceParentID()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Parent Categorias a la Base de Datos con el ID_Woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

  //? Agregar Todas las categorias a Woocomerce y Obtener ID woocommerce
  const categoriasInsertWoo = async(req = request, res = response) => {
    categoriasBDIWoo.postCategoriasInsertWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Insertar Categorias Woocomerce y Obtener ID woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }

  //? Actualizar Todas las categorias que tengan Parent a Woocomerce
  const categoriasUpdateWoo = async(req = request, res = response) => {

    categoriasBDIWoo.postCategoriasUpdateWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Actualizar Parent Categorias a la Base de Datos con el ID_Woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }


module.exports = {
    categoriasPostBD,
    categoriasPostBDIdentify,
    categoriasPostIdentifyPrincipales,
    categoriasPostParentCategoria,

    categoriasInsertWoo,
    categoriasUpdateWoo
}