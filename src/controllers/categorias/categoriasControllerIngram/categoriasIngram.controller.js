const { response, request } = require('express');
const pool = require('../../../database/conexion');


const postCategorias = require('../../../modules/CategoriasModule/CategoriasIngram/createCategories.modules');
const postCategoriasIdentify = require('../../../modules/CategoriasModule/CategoriasIngram/createCategoriesIdentify.modules');
const postCategoriasParents = require('../../../modules/CategoriasModule/CategoriasIngram/createCategoriesParent.modules')


const categoriasBD = new postCategorias(pool);
const categoriasBDIndentify = new postCategoriasIdentify(pool);
const categoriasBDIParent = new postCategoriasParents(pool)


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

// ? Actualizar Categorias Ingram en Woocommerce
const categoriasPostParentCategoria = async(req = request, res = response) => {

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

  const categoriasUpdateInserWoo = async(req = request, res = response) => {

    const ver = await categoriasClass.categoriasSeleccionadas();

    res.json({
        msg: 'Post Api - Update Categorias Generales en BD',
        data: ver
    })
  }


module.exports = {
    categoriasPostBD,
    categoriasPostBDIdentify,
    categoriasPostIdentifyPrincipales,
    categoriasPostParentCategoria,
    categoriasUpdateInserWoo
}