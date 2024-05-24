const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');

const { urlAPIImagenes } = require('../../../Helpers/helpsIngram/rutas.apintegracion');
const { urlUpdateProductWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');


const chunks = require('chunk-array').chunks
class postImagenes {
    constructor(pool) {
        this.pool = pool;
    }

    async AgregarImagenBD (){
        try {
            let msg = []

            //Consultar las fichas en API BDI
            const verImg = await axios.get(urlAPIImagenes);

            await Promise.all(verImg.data.map(async (item) => {
                const querySelect = 'SELECT * FROM ingramProductosv2 WHERE Sku_ingram = ?'
                const [row] = await this.pool.query(querySelect, [item.sku])
        
                if(row.length > 0){
                    
                    const imageUrls = item.image.length > 0 ? [item.imageP, ...item.image] : [item.imageP];
                    const id = row[0].id_woocommerce_producto;
                    
                    try {
                        const queryInsert = `INSERT INTO ingramImagenes (Sku_Ingram, Imagenes_url, id_Producto_Ingram) VALUES (?, ?, ?)`;
                        const valuesQuery = [item.sku, JSON.stringify(imageUrls), id]
                        await this.pool.query(queryInsert, valuesQuery);
    
                        console.log(queryInsert);
                        msg.push(queryInsert)
                        
                    } catch (error) {
                        console.error(error);
                        msg.push(error)
                        throw error;
                    }
                }
            }))

            return msg

        } catch (error) {
            throw error;
        }
    }

    

    async AgregarImagenWoo(){
        try {
            const configHeaders = new configAPIWoo();

            const config = await configHeaders.clavesAjusteGeneral();

            const querySelect = `SELECT * FROM ingramImagenes`

            const [rows] = await this.pool.query(querySelect);

            let data = rows.map((item) => {
                try {
                    const arrayFilas = JSON.parse(item.Imagenes_url);

                    const dataUrl = arrayFilas.map(files => ({ src: files }))

                    return {
                        id: item.id_Producto_Ingram,
                        images: dataUrl
                    }

                } catch (error) {
                    return null
                }
            })

            let infoNueva = chunks(data,100)

            let msg = [];

            const requests = infoNueva.map(async (img) => {
                try {
                    let datos = {
                        update: img
                    }
            
                    const response = await axios.post(urlUpdateProductWoo, datos,config);
                    console.log(response.data);
                    msg.push(response.data)
                    return `Se agrego una Imagen Nueva a: ${ response.data}`;
                } catch (error) {
                    return `Tienes un error ${error}`;
                }
            });
            
            await Promise.all(requests);

            return msg
        } catch (error) {
            throw error
        }
    }


}

module.exports = postImagenes