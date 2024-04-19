const { response, request } = require('express');
const Token = require('../Ingram/token')
const TokenBDI = require('../BDI/token.apibdi')

const tokenClass = new Token()
const tokenClassBDI = new TokenBDI();

const tokenUpdateIngram =  async(req = request, res = response) => {

    const data = await tokenClass.getTokenCreate();

    res.json({
        msg: 'GET TOKEN - Actualizando Token Ingram',
        data: {
            msg: 'Token Ingram - Actualizado en BD',
            database: data.affectedRows == 1 ? 'Se Actualizo Correctamente el Token Ingram' : 'Hubo un error'
        }
    })
}

const tokenUpdateBDI =  async(req = request, res = response) => {

    const data = await tokenClassBDI.crearToken();

    res.json({
        msg: 'GET TOKEN - Actualizando Token BDI',
        data: {
            msg: 'Token BDI - Actualizado en BD',
            database: data.affectedRows == 1 ? 'Se Actualizo Correctamente el Token BDI' : 'Hubo un error'
        }
    })
}


module.exports = {
    tokenUpdateIngram,
    tokenUpdateBDI
}