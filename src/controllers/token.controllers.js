const { response, request } = require('express');
const Token = require('../Ingram/token')
const tokenClass = new Token()
const tokenUpdateIngram =  async(req = request, res = response) => {

    const data = await tokenClass.getTokenV10();

    res.json({
        msg: 'GET TOKEN - Actualizando Token Ingram',
        data: {
            msg: 'Token Ingram - Actualizado en BD',
            database: data.affectedRows == 1 ? 'Se Actualizo Correctamente el Token Ingram' : 'Hubo un error'
        }
    })
}


module.exports = {
    tokenUpdateIngram
}