const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlUpdateProductWoo } = require('../../../Helpers/rutas.woocomerce');
const { urlPricesIngram } = require('../../../Helpers/helpsIngram/rutas.ingram');
const axios = require('axios');
const pool = require('../../../database/conexion');
const chunks = require('chunk-array').chunks

class PutProducts {

    async UpdateProductPricesBD(){
        try {
            const configIngram = new configAPIIngram();
            const config = await configIngram.configHeaderGeneral();
            const queryListSku = `SELECT * FROM tbl_productos`;
            const [rows] = await pool.query(queryListSku);
        
            let data = rows.map(item => ({ ingramPartNumber: item.sku }));
            const productsRows = chunks(data, 50);
            let msg = [];
        
            await Promise.all(productsRows.map(async (iterator) => {
                try {
                    let data = { products: iterator };
                    const resp = await axios.post(urlPricesIngram, data, config);
        
                    for (const validarItem of resp.data) {

                        
                        const pricesIngram = (validarItem.hasOwnProperty('pricing') && validarItem.pricing.hasOwnProperty('customerPrice')) ? validarItem.pricing.customerPrice: 0
                        const PartNumber = validarItem.ingramPartNumber;
                        const quantity = (validarItem.hasOwnProperty('availability') && validarItem.availability.hasOwnProperty('totalAvailability')) ? validarItem.availability.totalAvailability : 0
                        const qty = (validarItem.productStatusMessage === "CUSTOMER NOT AUTHORIZED" || validarItem.productStatusMessage === "ITEM DISCONTINUED") ? 0 : quantity
                        
                        const statusChange = "publish";
                        const visibility = qty > 0 ? "visible" : "hidden";
        
                        const queryUtilidadGeneral = `SELECT * FROM tbl_utilidades WHERE id = 1`;
                        const queryUtilidades = `SELECT pr.utilidad_Product, ct.utilidad_Categoria, mr.utilidad_Marca FROM tbl_productos AS pr INNER JOIN tbl_categorias AS ct ON pr.id_categoria = ct.id INNER JOIN tbl_marcas AS mr ON pr.id_marca = mr.id WHERE pr.sku = ?`;
        
                        const [utilidad_General] = await pool.query(queryUtilidadGeneral);
                        const [utilidades] = await pool.query(queryUtilidades, [PartNumber]);
        
                        let utilidad = 0.0;

                        // Accediendo a las propiedades de forma segura
                        const utilidad_Product = utilidades[0]?.utilidad_Product;
                        const utilidad_Categoria = utilidades[0]?.utilidad_Categoria;
                        const utilidad_Marca = utilidades[0]?.utilidad_Marca;
                        const id_Utilidad_General = utilidad_General[0]?.id_Utilidad_General;

                        if (utilidad_Product > 0) {
                            utilidad = parseFloat(utilidad_Product / 100) + 1;
                        } else if (utilidad_Marca > 0) {
                            utilidad = parseFloat(utilidad_Marca / 100) + 1;
                        } else if (utilidad_Categoria > 0) {
                            utilidad = parseFloat(utilidad_Categoria / 100) + 1;
                        } else if (id_Utilidad_General) {
                            utilidad = parseFloat(id_Utilidad_General / 100) + 1;
                        } else {
                            console.log("No hay utilidad")
                        }

                        const prices = pricesIngram * utilidad;
                        const cantidadTotal = qty;
        
                        const queryUpdate = `UPDATE tbl_productos SET price = ?, status = ?, catalog_visibility = ?, quantity = ? WHERE sku = ?`;
                        const values = [prices.toFixed(5), statusChange, visibility, cantidadTotal, PartNumber];
                        await pool.query(queryUpdate, values);
        
                        msg.push(`Se actualizo correctamente los precios y stock-- ${PartNumber} -- ${ prices }`);
                    }
                } catch (error) {
                    msg.push(`Tienes un error: ${error}`);
                }
            }));
            console.log('Exitoso')
            return msg;
        } catch (error) {
            throw error;
        }
        
    }

    async UpdateProductPricesAndSockWoo(){
        try {
            const configWoo = new configAPIWoo();

            const config = await configWoo.clavesAjusteGeneral();

            console.log(config);

            const querySelect = `SELECT * FROM tbl_productos`;

            const [row] = await pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id,
                    status: item.status,
                    catalog_visibility: item.catalog_visibility,
                    stock_quantity: item.quantity,
                    reviews_allowed: false
                }
            })

            const productsRows = chunks(data,100);

            let msg = []
            let i = 0
            
            const requests = productsRows.map(async (product) => {
                try {
                    let data = {
                        update: product
                    }
    
                    await axios.post(urlUpdateProductWoo, data, config);
                    i++
                    console.log(`Se actualizo correctamente en Woo: -- ${ i }`);
                    msg.push(`Se actualizo correctamente en Woo: -- ${ i }`);
                } catch (error) {
                    msg.push(`Tienes un error: ${ error }`)
                    throw error
                }
            });

            await Promise.all(requests);

            return msg
        } catch (error) {
            throw error
        }
    }
}

module.exports = PutProducts