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
            let msg = [];
    
            // Consultar las fichas en API BDI
            const verImg = await axios.get(urlAPIImagenes);
    
            await Promise.all(verImg.data.map(async (item) => {
                const querySelect = 'SELECT * FROM ingramProductosv2 WHERE Sku_ingram = ?';
                const [rows] = await this.pool.query(querySelect, [item.sku]);
    
                if (rows.length > 0) {
                    const imageUrls = item.image.length > 0 ? [item.imageP, ...item.image] : [item.imageP];
                    const id = rows[0].id_woocommerce_producto;
    
                    try {
                        // Verificar si la imagen ya existe en ingramImagenes
                        const querySelectImg = 'SELECT * FROM ingramImagenes WHERE Sku_Ingram = ?';
                        const [imgRows] = await this.pool.query(querySelectImg, [item.sku]);
    
                        if (imgRows.length > 0) {
                            // Actualizar las imágenes existentes
                            const queryUpdate = 'UPDATE ingramImagenes SET Imagenes_url = ? WHERE Sku_Ingram = ?';
                            const valuesUpdate = [JSON.stringify(imageUrls), item.sku];
                            await this.pool.query(queryUpdate, valuesUpdate);
                            console.log(`Imágenes actualizadas para SKU: ${item.sku}`);
                            msg.push(`Imágenes actualizadas para SKU: ${item.sku}`);
                        } else {
                            // Insertar nuevas imágenes
                            const queryInsert = 'INSERT INTO ingramImagenes (Sku_Ingram, Imagenes_url, id_Producto_Ingram) VALUES (?, ?, ?)';
                            const valuesInsert = [item.sku, JSON.stringify(imageUrls), id];
                            await this.pool.query(queryInsert, valuesInsert);
                            console.log(`Imágenes insertadas para SKU: ${item.sku}`);
                            msg.push(`Imágenes insertadas para SKU: ${item.sku}`);
                        }
                    } catch (error) {
                        console.error(error);
                        msg.push(error);
                        throw error;
                    }
                }
            }));
    
            return msg;
    
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