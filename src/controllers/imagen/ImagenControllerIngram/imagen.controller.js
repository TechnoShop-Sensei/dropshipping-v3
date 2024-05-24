const { response, request } = require('express');
const pool = require('../../../database/conexion');
const postImagenes = require('../../../modules/images/ImagesIngram/postImages.modules');

const imgClass = new postImagenes(pool);


  const ImagenCrearBD = async(req = request, res = response) => {
    imgClass.AgregarImagenBD()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Imagenes a productos BD',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }


  

  const ImagenAgregarWoo = async(req = request, res = response) => {
    imgClass.AgregarImagenWoo()
    .then(msg => {
        console.log(msg);
        res.status(201).json({
              mensaje: 'Post Api - Agregando Imagenes a productos a Woocommerce',
              datos: msg
          })
    })
    .catch(error => {
        console.error(error);
    });
  }



module.exports = {
    ImagenCrearBD,
    ImagenAgregarWoo
}