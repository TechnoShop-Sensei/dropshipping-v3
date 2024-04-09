const { response, request } = require('express');
const postImagenes = require('../../modules/images/postImages.modules');

const imgClass = new postImagenes();


const ImagenPost = async (req = request, res = response) => {

    const ver = await imgClass.AgregarImagenBD();

    res.status(201).json({
        msg: 'Post Api - Agregar fichas a Base de Datos',
        data: ver
    })
  }

  


const ImagenPostWoo = async (req = request, res = response) => {

  const ver = await imgClass.AgregarImagenWoo();

    res.status(201).json({
        msg: 'Post Api - Agregar fichas a Woocommerce',
        data: ver
    })
  }



module.exports = {
    ImagenPost,
    ImagenPostWoo
}