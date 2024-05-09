const { response, request } = require('express');
const pool = require('../../../database/conexion');

const postMarcas = require('../../../modules/MarcasModule/MarcasIngram/createBrands.modules');
const postMarcasIndentify = require('../../../modules/MarcasModule/MarcasIngram/createBrandsIdentify.modules')
const postMarcasWoo = require('../../../modules/MarcasModule/MarcasIngram/createBrandsWoo.modules')
const postMarcasClass = new postMarcas(pool);
const postMarcasClassIndentify = new postMarcasIndentify(pool);
const postMarcasClassWoo = new postMarcasWoo(pool);


// ? Almacenar Marcas de Ingram en BD
const marcasPost = async (req = request, res = response) => {

    postMarcasClass.ejecutar()
        .then(msg => {
            console.log(msg);
            res.status(201).json({
                  mensaje: 'Post Api - Agregando Marcas a la Base de Datos Provenientes de BDI',
                  datos: msg
              })
        })
        .catch(error => {
            console.error(error);
        });
  }

// ? Almacenar Marcas con Identificador especial para Ingram en BD
const marcasPostBD = async(req = request, res = response) => {

    postMarcasClassIndentify.createMarcasIdentifyBDI()
        .then(msg => {
            console.log(msg);
            res.status(201).json({
                  mensaje: 'Post Api - Agregando Marcas a la Base de Datos el Indentificador',
                  datos: msg
              })
        })
        .catch(error => {
            console.error(error);
        });
}


// ? Añadir Marcas de BDI con Identificador en Woocommerce.
const marcasPostWoo = async(req = request, res = response) => {

    postMarcasClassWoo.AgregarMarcasWoo()
        .then(msg => {
            console.log(msg);
            res.status(201).json({
                  mensaje: 'Post Api - Agregando Marcas Woocommerce Provenientes de BD wooMarcasNew',
                  datos: msg
              })
        })
        .catch(error => {
            console.error(error);
        });
}



module.exports = {
    marcasPost,
    marcasPostBD,
    marcasPostWoo
}