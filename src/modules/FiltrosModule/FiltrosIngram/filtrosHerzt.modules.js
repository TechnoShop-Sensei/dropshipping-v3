const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlGetHerzt, urlCreateHerzt } = require('../../../Helpers/rutas.woocomerce');

const axios = require('axios');
const chunks = require('chunk-array').chunks

// Solo Realiza Acciones de Woo
class PostFiltrosHerzt {
    constructor(pool){
        this.pool = pool;
    }
    
    async AddAndUpdateFiltrosHerztWoo() {
        try {
            const configWoo = new configAPIWoo();
            const config = await configWoo.clavesAjusteGeneral();
    
            const querySelect = `SELECT * FROM ingramFiltrosPorHerzt`;
            const [rows] = await this.pool.query(querySelect);
    
            const data = rows.map((item) => ({
                name: item.Nombre_Herzt,
                description: item.descripcion_Herzt !== null && item.descripcion_Herzt.length > 0 ? item.descripcion_Herzt : ''
            }));
    
            const productsRows = chunks(data, 100);
            let msg = [];
            let i = 0;
    
            const requests = productsRows.map(async (productBatch) => {
                try {
                    for (const product of productBatch) {
                        // Verificar si el color ya existe en WooCommerce
                        const wooProductResponse = await axios.get(urlGetHerzt, config);
                        const existingProduct = wooProductResponse.data.find(p => p.name.toLowerCase() === product.name.toLowerCase());
    
                        if (existingProduct) {
                            // Actualizar el color existente
                            const dataToUpdate = {
                                update: [{ id: existingProduct.id, name: product.name, description: product.description }]
                            };
    
                            await axios.post(urlCreateHerzt, dataToUpdate, config);
                            console.log(`Se actualizó la HERZT correctamente en Woo: -- ${existingProduct.id}`);
                            msg.push(`Se actualizó la HERZT correctamente en Woo: -- ${existingProduct.id}`);
                        } else {
                            // Crear un nuevo color
                            const dataToCreate = {
                                create: [{ name: product.name, description: product.description }]
                            };
    
                            const createResponse = await axios.post(urlCreateHerzt, dataToCreate, config);

                            await Promise.all(createResponse.data.create.map(async (element) => {
                                const idHerzt = element.id;
                                const NameHerzt = element.name;
                                const queryUpdate = `UPDATE ingramFiltrosPorHerzt SET id_woocommerce_Herzt = ? WHERE Nombre_Herzt = ?`;
                                await this.pool.query(queryUpdate, [idHerzt, NameHerzt]);
                                
                                msg.push(`Se agregó una nuevo Herzt: ${element.id}, Nombre: ${element.name}`);
                            }));
                        }
                        i++;
                    }
                } catch (error) {
                    msg.push(`Tienes un error: ${error}`);
                    throw error;
                }
            });
    
            await Promise.all(requests);
            return msg;
        } catch (error) {
            throw error;
        }
    }

     
    async AgregarSegunHerzt() {
        try {
            // Obtener las pulgadas de la tabla IngramFiltrosPorPulgadas
            const queryHerzt = `SELECT * FROM ingramFiltrosPorHerzt`;
            const [herzt] = await this.pool.query(queryHerzt);
    
            // Obtener los productos de la tabla ingramProductosv2
            const queryProductos = `SELECT * FROM ingramProductosv2`;
            const [productos] = await this.pool.query(queryProductos);
    
            let msg = [];
    
            for (const producto of productos) {
                const { id_woocommerce_producto, Nombre_Optimatizado, Sku_ingram } = producto;
    
                // Comprobar si Nombre_Optimatizado no es null
                if (Nombre_Optimatizado) {
                    // Normalizar el Nombre_Optimatizado para comparación
                    const nombreOptimizadLower = Nombre_Optimatizado.toLowerCase();
    
                    let pulgadaEncontrada = false;
                    for (const hert of herzt) {
                        const nombrePulgada = hert.Nombre_Pulgada.toLowerCase();
    
                        // Verificar si Nombre_Optimatizado contiene la pulgada exacta o combinada
                        if (nombrePulgada.includes('a')) {
                            const regex = new RegExp(`(^|\\s|\\W)${nombrePulgada}(\\s|\\W|$)`, 'i');
                            if (regex.test(nombreOptimizadLower)) {
                                const queryInsert = `
                                    INSERT INTO WooFiltrosHerztProductos (id_hertz_woo, id_Producto_woo, Sku_Producto_woo, herzt) 
                                    VALUES (?, ?, ?, ?)
                                `;
                                const values = [hert.id_woocommerce_Herzt, id_woocommerce_producto, Sku_ingram, hert.Nombre_Herzt ];
                                await this.pool.query(queryInsert, values);

                                console.log(`Herzt ${hert.Nombre_Pulgada} asociada correctamente al producto con SKU: ${Sku_ingram}`);
                                msg.push(`Herzt ${hert.Nombre_Pulgada} asociada correctamente al producto con SKU: ${Sku_ingram}`);
                                pulgadaEncontrada = true;

                                break;
                            }
                        }
                    }
    
                    if (!pulgadaEncontrada) {
                        for (const pulgada of herzt) {
                            const nombrePulgada = pulgada.Nombre_Pulgada.toLowerCase();
    
                            // Verificar si Nombre_Optimatizado contiene la pulgada exacta y no es una combinación
                            if (!nombrePulgada.includes('a') && nombreOptimizadLower.includes(nombrePulgada)) {
                                const regex = new RegExp(`(^|\\s|\\W)${nombrePulgada}(\\s|\\W|$)`, 'i');
                                if (regex.test(nombreOptimizadLower)) {
                                    const queryInsert = `
                                        INSERT INTO WooFiltrosHerztProductos (id_pulgadas_woo, id_Producto_woo, Sku_Producto_woo, Pulgada, date_Update) 
                                        VALUES (?, ?, ?, ?, NOW())
                                    `;
                                    const values = [pulgada.id_woocommerce_pulgadas, id_woocommerce_producto, Sku_ingram, pulgada.Nombre_Pulgada];
                                    await this.pool.query(queryInsert, values);
                                    console.log(`Pulgada ${pulgada.Nombre_Pulgada} asociada correctamente al producto con SKU: ${Sku_ingram}`);
                                    msg.push(`Pulgada ${pulgada.Nombre_Pulgada} asociada correctamente al producto con SKU: ${Sku_ingram}`);
                                    pulgadaEncontrada = true;
                                    break;
                                }
                            }
                        }
                    }
    
                    if (!pulgadaEncontrada) {
                        console.log(`El producto con SKU: ${Sku_ingram} no tiene una pulgada reconocida en Nombre_Optimatizado`);
                        msg.push(`El producto con SKU: ${Sku_ingram} no tiene una pulgada reconocida en Nombre_Optimatizado`);
                    }
                } else {
                    console.log(`El producto con SKU: ${Sku_ingram} no tiene Nombre_Optimatizado`);
                    msg.push(`El producto con SKU: ${Sku_ingram} no tiene Nombre_Optimatizado`);
                }
            }
    
            return msg;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = PostFiltrosHerzt