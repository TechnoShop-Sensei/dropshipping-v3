const { response, request } = require('express');
const postOrders = require('../../modules/orders/postOrder.modules')
const postOrderClass = new postOrders();

const ordersCreateIngram = async(req = request, res = response) => {

    //const ver = await postOrderClass
    const body = req.body;

    const order = await postOrderClass.CreateOrderIngram(body.status, body)

    console.log(order);

    res.status(201).json({
        msg: 'POST - Validando Orden Ingram',
        body: order
    })
}

const ordersUpdateIngram = async(req = request, res = response) => {

    //const ver = await postOrderClass
    const body = req.body;

    const order = await putOrderClass.UpdateOrderIngram(body)

    console.log(order);

    res.status(201).json({
        msg: 'POST - Validando Orden Ingram',
        body: order
    })
}

module.exports = {
    ordersCreateIngram,
    ordersUpdateIngram
}