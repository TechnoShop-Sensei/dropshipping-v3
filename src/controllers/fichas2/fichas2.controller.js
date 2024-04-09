const { response, request } = require('express');
const postFichas2 = require('../../modules/fichas2/postFichas.modules');

const fichasclass = new postFichas2();


const fichasPost = async (req = request, res = response) => {

    const ver = await fichasclass.processProducts();

    res.status(201).json({
        msg: 'Post Api - Agregar fichas a Base de Datos',
        data: ver
    })
  }

  const fichasPostData = async (req = request, res = response) => {

    const ver = await fichasclass.ObetenerDatos();

    res.status(201).json({
        msg: 'Post Api - Obtener Datos Ficha',
        data: ver
    })
  }




module.exports = {
    fichasPost,
    fichasPostData,

}