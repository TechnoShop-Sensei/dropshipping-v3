const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlProductosBDI } = require('../../../Helpers/helpsIngram/rutas.bdi');
const { urlCreateProductWoo, urlUpdateProductWoo } = require('../../../Helpers/rutas.woocomerce');
const { urlPricesIngram } = require('../../../Helpers/helpsIngram/rutas.ingram');

const axios = require('axios');
const chunks = require('chunk-array').chunks

// Solo Realiza Acciones de Woo
class PostProductosWoo {
    constructor(pool){
        this.pool = pool;
    }
    
    async UpdateProductCategoriasWoo(){
        try {
            const configWoo = new configAPIWoo();
            const config = await configWoo.clavesAjusteGeneral();

            console.log(config);

            const querySelect = `SELECT * FROM ingramProductosv2 as pr INNER JOIN wooMarcasNew as mr on pr.id_marca = mr.id_woocommerce`;

            const [row] = await this.pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id_woocommerce_producto,
                    categories: [
                        {
                            id: item.id_categoria
                        },
                        {
                            id: item.id_subcategoria
                        }
                    ]
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
                    console.log(`Se actualizo Categorias correctamente en Woo: -- ${ i }`);
                    msg.push(`Se actualizo Categorias correctamente en Woo: -- ${ i }`);
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

    
    async ActualizarTitulosAWoo(){
        try {
            const configWoo = new configAPIWoo();

            const config = await configWoo.clavesAjusteGeneral();

            console.log(config);

            const querySelect = `SELECT * FROM tbl_productos`;

            const [row] = await pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id,
                    name: item.Nombre_Optimatizado !== null ? item.Nombre_Optimatizado : item.Nombre,
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

module.exports = PostProductosWoo