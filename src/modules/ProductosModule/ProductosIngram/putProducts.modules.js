const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlUpdateProductWoo } = require('../../../Helpers/rutas.woocomerce');
const { urlPricesIngram } = require('../../../Helpers/helpsIngram/rutas.ingram');
const axios = require('axios');
const chunks = require('chunk-array').chunks

class PutProductsPricesandStock {
    constructor(pool){
        this.pool = pool;
    }

    async UpdateProductPricesBD(){
        try {
            const configIngram = new configAPIIngram();
            const config = await configIngram.configHeaderGeneral();

            const queryListSku = `SELECT * FROM ingramProductosv2`;

            const [rows] = await pool.query(queryListSku);
        
            let data = rows.map(item => ({ ingramPartNumber: item.Sku_ingram }));
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
        
                        const queryUtilidadGeneral = `SELECT * FROM ingramUtilidadesGeneral WHERE id_utilidades_ingram = 1`;
                        const queryUtilidades = `SELECT pr.Utilidad_por_Producto, ct.Utilidad_por_Categoria, mr.Utilidad_por_Marca FROM ingramProductosv2 AS pr INNER JOIN wooCategoriasNew2 AS ct ON pr.id_categoria = ct.id_woocommerce INNER JOIN wooMarcasNew AS mr ON pr.id_marca = mr.id_woocommerce WHERE pr.Sku_ingram = ?`;
        
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

                        const IVA = 1.16

                        const prices = pricesIngram * utilidad;
                        const prices_final = (prices * utilidad) * IVA
                        const cantidadTotal = qty;
        
                        const queryUpdate = `UPDATE ingramProductosv2 SET Precio_Ingram = ?, Precio_Ingram_Utilidad = ?, Precio_Final = ?, Status_Woocommerce = ?, Catalog_visibility_Woo = ?, Cantidad = ? WHERE Sku_ingram = ?`;
                        const values = [pricesIngram.toFixed(5), prices.toFixed(5), prices_final.toFixed(5), statusChange, visibility, cantidadTotal, PartNumber];
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

            const querySelect = `SELECT * FROM ingramProductosv2`;

            const [row] = await this.pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id_woocommerce_producto,
                    status: item.Status_Woocommerce,
                    regular_price: item.Precio_Ingram_Utilidad,
                    catalog_visibility: item.Catalog_visibility_Woo,
                    stock_quantity: item.Cantidad,
                    reviews_allowed: true
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

module.exports = PutProductsPricesandStock