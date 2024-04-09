const { response, request } = require('express');
const postMarcas = require('../../modules/marcas/postMarcas.modules')
const pool = require('../../database/conexion');
const postMarcasClass = new postMarcas(pool);


// ? Crear Marcas de Ingram
const marcasPost = async (req = request, res = response) => {

    postMarcasClass.ejecutar()
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

// ? Crear Marcas de Ingram en Wooocommerce
const marcasPostWoo = async(req = request, res = response) => {

    postMarcasClass.AgregarMarcasWoo()
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



module.exports = {
    marcasPost,
    marcasPostWoo
}