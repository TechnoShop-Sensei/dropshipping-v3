const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlCreatePulgadas, urlGetPulgadas, } = require('../../../Helpers/rutas.woocomerce');

const axios = require('axios');
const chunks = require('chunk-array').chunks

// Solo Realiza Acciones de Woo
class PostFiltrosPulgadas {
    constructor(pool){
        this.pool = pool;
    }
    
    async AddAndUpdateFiltrosPulgadasWoo() {
        try {
            const configWoo = new configAPIWoo();
            const config = await configWoo.clavesAjusteGeneral();
    
            const querySelect = `SELECT * FROM IngramFiltrosPorPulgadas`;
            const [rows] = await this.pool.query(querySelect);
    
            const data = rows.map((item) => ({
                name: item.Nombre_Pulgada,
                description: item.Descripcion_Pulgada !== null && item.Descripcion_Pulgada.length > 0 ? item.Descripcion_Pulgada : ''
            }));
    
            const productsRows = chunks(data, 100);
            let msg = [];
            let i = 0;
    
            const requests = productsRows.map(async (productBatch) => {
                try {
                    for (const product of productBatch) {
                        // Verificar si el color ya existe en WooCommerce
                        const wooProductResponse = await axios.get(urlGetPulgadas, config);
                        const existingProduct = wooProductResponse.data.find(p => p.name.toLowerCase() === product.name.toLowerCase());
    
                        if (existingProduct) {
                            // Actualizar el color existente
                            const dataToUpdate = {
                                update: [{ id: existingProduct.id, name: product.name, description: product.description }]
                            };
    
                            await axios.post(urlCreatePulgadas, dataToUpdate, config);
                            console.log(`Se actualizó la PULGADA correctamente en Woo: -- ${existingProduct.id}`);
                            msg.push(`Se actualizó la PULGADA correctamente en Woo: -- ${existingProduct.id}`);
                        } else {
                            // Crear un nuevo color
                            const dataToCreate = {
                                create: [{ name: product.name, description: product.description }]
                            };
    
                            const createResponse = await axios.post(urlCreatePulgadas, dataToCreate, config);

                            await Promise.all(createResponse.data.create.map(async (element) => {
                                const idColor = element.id;
                                const NameColor = element.name;
                                const queryUpdate = `UPDATE IngramFiltrosPorPulgadas SET id_woocommerce_pulgadas = ? WHERE Nombre_Pulgada = ?`;
                                await this.pool.query(queryUpdate, [idColor, NameColor]);
                                
                                msg.push(`Se agregó una nueva Pulgada: ${element.id}, Nombre: ${element.name}`);
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

     
    async AgregarSegunPulgadas() {
        try {
            // Obtener las pulgadas de la tabla IngramFiltrosPorPulgadas
            const queryPulgadas = `SELECT * FROM IngramFiltrosPorPulgadas`;
            const [pulgadas] = await this.pool.query(queryPulgadas);
    
            // Obtener los productos de la tabla ingramProductosv2
            const queryProductos = `SELECT * FROM ingramProductosv2 WHERE id_subcategoria IN (951, 999, 995, 1011);`;
            const [productos] = await this.pool.query(queryProductos);
    
            let msg = [];
    
            for (const producto of productos) {
                const { id_woocommerce_producto, Nombre_Optimatizado, Sku_ingram } = producto;
    
                // Comprobar si Nombre_Optimatizado no es null
                if (Nombre_Optimatizado) {
                    // Normalizar el Nombre_Optimatizado para comparación
                    const nombreOptimizadLower = Nombre_Optimatizado.toLowerCase();
    
                    let pulgadaEncontrada = false;
                    for (const pulgada of pulgadas) {
                        const nombrePulgada = pulgada.Nombre_Pulgada.toLowerCase();
    
                        // Verificar si Nombre_Optimatizado contiene la pulgada exacta o combinada
                        if (nombrePulgada.includes('a')) {
                            const regex = new RegExp(`(^|\\s|\\W)${nombrePulgada}(\\s|\\W|$)`, 'i');
                            if (regex.test(nombreOptimizadLower)) {
                                const queryInsert = `
                                    INSERT INTO WooFiltrosPulgadasProductos (id_pulgadas_woo, id_Producto_woo, Sku_Producto_woo, Pulgada, date_Update) 
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
    
                    if (!pulgadaEncontrada) {
                        for (const pulgada of pulgadas) {
                            const nombrePulgada = pulgada.Nombre_Pulgada.toLowerCase();
    
                            // Verificar si Nombre_Optimatizado contiene la pulgada exacta y no es una combinación
                            if (!nombrePulgada.includes('a') && nombreOptimizadLower.includes(nombrePulgada)) {
                                const regex = new RegExp(`(^|\\s|\\W)${nombrePulgada}(\\s|\\W|$)`, 'i');
                                if (regex.test(nombreOptimizadLower)) {
                                    const queryInsert = `
                                        INSERT INTO WooFiltrosPulgadasProductos (id_pulgadas_woo, id_Producto_woo, Sku_Producto_woo, Pulgada, date_Update) 
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

module.exports = PostFiltrosPulgadas