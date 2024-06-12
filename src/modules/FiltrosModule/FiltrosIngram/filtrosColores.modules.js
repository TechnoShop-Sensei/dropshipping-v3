const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlCreateColores, urlGetColores, } = require('../../../Helpers/rutas.woocomerce');

const axios = require('axios');
const chunks = require('chunk-array').chunks

// Solo Realiza Acciones de Woo
class PostFiltrosColores {
    constructor(pool){
        this.pool = pool;
    }
    
    async AddAndUpdateFiltroColorsWoo() {
        try {
            const configWoo = new configAPIWoo();
            const config = await configWoo.clavesAjusteGeneral();
            console.log(config);
    
            const querySelect = `SELECT * FROM IngramFiltrosPorColores`;
            const [rows] = await this.pool.query(querySelect);
    
            const data = rows.map((item) => ({
                id: item.id_woocommerce_colores,
                name: item.Nombre_Color,
                description: item.Descripcion_Color !== null && item.Descripcion_Color.length > 0 ? item.Descripcion_Color : ''
            }));
    
            const productsRows = chunks(data, 100);
            let msg = [];
            let i = 0;
    
            const requests = productsRows.map(async (productBatch) => {
                try {
                    for (const product of productBatch) {
                        // Verificar si el color ya existe en WooCommerce usando el parámetro search
                        const wooProductResponse = await axios.get(`${urlGetColores}?include=${encodeURIComponent(product.id)}`, config);
                        const exactMatchProduct = wooProductResponse.data.find(p => p.id === product.id);
    
                        if (exactMatchProduct) {
                            // Verificar si los nombres son diferentes y actualizar si es necesario
                            if (exactMatchProduct.name.toLowerCase() !== product.name.toLowerCase() || exactMatchProduct.description !== product.description) {
                                const dataToUpdate = {
                                    update: [{ id: exactMatchProduct.id, name: product.name, description: product.description }]
                                };
    
                                await axios.post(urlCreateColores, dataToUpdate, config);
                                console.log(`Se actualizó el COLOR correctamente en Woo: -- ${exactMatchProduct.id}`);
                                msg.push(`Se actualizó el COLOR correctamente en Woo: -- ${exactMatchProduct.id}`);
                            }else{
                                console.log('====================================');
                                console.log("Ya Existe, No recibio actualizacion el color.");
                                console.log('====================================');
                            }
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

module.exports = PostFiltrosColores