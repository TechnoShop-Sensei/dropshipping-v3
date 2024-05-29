const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlCreateColores, urlGetColores, } = require('../../../Helpers/rutas.woocomerce');

const axios = require('axios');
const chunks = require('chunk-array').chunks

// Solo Realiza Acciones de Woo
class PostProductosWoo {
    constructor(pool){
        this.pool = pool;
    }

    
    
    async UpdateProductCategoriasWoo() {
        try {
            const configWoo = new configAPIWoo();
            const config = await configWoo.clavesAjusteGeneral();
            console.log(config);
    
            const querySelect = `SELECT * FROM IngramFiltrosPorColores`;
            const [rows] = await this.pool.query(querySelect);
    
            const data = rows.map((item) => ({
                name: item.Nombre_Color,
                description: item.Descripcion_Color !== null && item.Descripcion_Color.length > 0 ? item.Descripcion_Color : ''
            }));
    
            const productsRows = chunks(data, 100);
            let msg = [];
            let i = 0;
    
            const requests = productsRows.map(async (productBatch) => {
                try {
                    for (const product of productBatch) {
                        // Verificar si el color ya existe en WooCommerce
                        const wooProductResponse = await axios.get(urlGetColores, config);
                        const existingProduct = wooProductResponse.data.find(p => p.name.toLowerCase() === product.name.toLowerCase());
    
                        if (existingProduct) {
                            // Actualizar el color existente
                            const dataToUpdate = {
                                update: [{ id: existingProduct.id, name: product.name, description: product.description }]
                            };
    
                            await axios.post(urlCreateColores, dataToUpdate, config);
                            console.log(`Se actualizó la categoría correctamente en Woo: -- ${existingProduct.id}`);
                            msg.push(`Se actualizó la categoría correctamente en Woo: -- ${existingProduct.id}`);
                        } else {
                            // Crear un nuevo color
                            const dataToCreate = {
                                create: [{ name: product.name, description: product.description }]
                            };
    
                            const createResponse = await axios.post(urlCreateColores, dataToCreate, config);

                            await Promise.all(createResponse.data.create.map(async (element) => {
                                const idColor = element.id;
                                const NameColor = element.name;
                                const queryUpdate = `UPDATE IngramFiltrosPorColores SET id_woocommerce_colores = ? WHERE Nombre_Color = ?`;
                                await this.pool.query(queryUpdate, [idColor, NameColor]);
                                
                                msg.push(`Se agregó un nuevo Color: ${element.id}, Nombre: ${element.name}`);
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

     
    async AgregarSegunColor() {
        try {
            // Obtener los colores de la tabla IngramFiltrosPorColores
            const queryColores = `SELECT * FROM IngramFiltrosPorColores`;
            const [colores] = await this.pool.query(queryColores);
    
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
    
                    let colorEncontrado = false;
                    for (const color of colores) {
                        const nombreColor = color.Nombre_Color.toLowerCase();
    
                        // Verificar si Nombre_Optimatizado contiene el color exacto, ya sea simple o combinado
                        if (nombreOptimizadLower.includes(nombreColor)) {
                            const palabras = nombreOptimizadLower.split(/[\s,]+/);
                            if (palabras.includes(nombreColor)) {
                                const queryInsert = `
                                    INSERT INTO WooFiltrosColoresProductos (id_colores_woo, id_Producto_woo, Sku_Producto_woo, Color, date_Update) 
                                    VALUES (?, ?, ?, ?, NOW())
                                `;
                                const values = [color.id_woocommerce_colores, id_woocommerce_producto, Sku_ingram, color.Nombre_Color];
                                await this.pool.query(queryInsert, values);
                                console.log(`Color ${color.Nombre_Color} asociado correctamente al producto con SKU: ${Sku_ingram}`);
                                msg.push(`Color ${color.Nombre_Color} asociado correctamente al producto con SKU: ${Sku_ingram}`);
                                colorEncontrado = true;
                                break;
                            }
                        }
                    }
    
                    if (!colorEncontrado) {
                        console.log(`El producto con SKU: ${Sku_ingram} no tiene un color reconocido en Nombre_Optimatizado`);
                        msg.push(`El producto con SKU: ${Sku_ingram} no tiene un color reconocido en Nombre_Optimatizado`);
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

module.exports = PostProductosWoo