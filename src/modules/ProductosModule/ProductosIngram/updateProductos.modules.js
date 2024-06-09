const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlCreateProductWoo, urlUpdateProductWoo, urlViewCategoriasWoo } = require('../../../Helpers/rutas.woocomerce');

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

            const querySelect = `SELECT * FROM ingramProductosv2`;

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
                    console.log(`Se actualizo Categorias correctamente la categoria en Woo: -- ${ i }`);
                    msg.push(`Se actualizo Categorias correctamente la categoria en Woo: -- ${ i }`);
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

            const querySelect = `SELECT * FROM ingramProductosv2`;

            const [row] = await this.pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id_woocommerce_producto,
                    name: item.Nombre_Optimatizado !== null || item.Nombre_Optimatizado ? item.Nombre_Optimatizado : item.Nombre,
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
                    console.log(`Se actualizo correctamente el titulo en woo: -- ${ i }`);
                    msg.push(`Se actualizo correctamente el titulo en woo: -- ${ i }`);
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

    async updateWooCommerceIDs() {
        try {
            const configHeader = new configAPIWoo();
            const config = await configHeader.clavesAjusteGeneral();
    
            // Obtener todas las categorías de la base de datos
            const querySelectUpdate = `SELECT * FROM wooCategoriasNew2`;
            const [rows] = await this.pool.query(querySelectUpdate);
    
            const msg = [];
            const updatePromises = rows.map(async (categoria) => {
                try {
                    // Buscar la categoría en WooCommerce por nombre
                    const response = await axios.get(`https://techno-shop.mx/wp-json/wc/v3/products/categories?search=${encodeURIComponent(categoria.Nombre_Categoria)}`, config);
                    const wooCategories = response.data;
    
                    // Verificar si alguna categoría en WooCommerce tiene el mismo nombre exacto que la de la base de datos
                    const wooCategory = wooCategories.find(cat => cat.name.toLowerCase() === categoria.Nombre_Categoria.toLowerCase());
    
                    if (wooCategory) {
                        // Verificar si el ID de WooCommerce es diferente al de la base de datos
                        if (categoria.id_woocommerce !== wooCategory.id) {
                            const queryUpdate = `UPDATE wooCategoriasNew2 SET id_woocommerce = ? WHERE Nombre_Categoria = ?`;
                            const values = [wooCategory.id, categoria.Nombre_Categoria];
                            const [result] = await this.pool.query(queryUpdate, values);
    
                            if (result.affectedRows > 0) {
                                msg.push(`Se actualizó la categoría: ${categoria.Nombre_Categoria} con id_woocommerce: ${wooCategory.id}`);
                                console.log(`Se actualizó la categoría: ${categoria.Nombre_Categoria} con id_woocommerce: ${wooCategory.id}`);
                            } else {
                                msg.push(`No se encontró la categoría: ${categoria.Nombre_Categoria} para actualizar`);
                                console.log(`No se encontró la categoría: ${categoria.Nombre_Categoria} para actualizar`);
                            }
                        } else {
                            msg.push(`El ID de WooCommerce ya es igual para la categoría: ${categoria.Nombre_Categoria}`);
                            console.log(`El ID de WooCommerce ya es igual para la categoría: ${categoria.Nombre_Categoria}`);
                        }
                    } else {
                        msg.push(`Categoría no encontrada en WooCommerce: ${categoria.Nombre_Categoria}`);
                        console.log(`Categoría no encontrada en WooCommerce: ${categoria.Nombre_Categoria}`);
                    }
                } catch (error) {
                    console.error(`Error al actualizar la categoría - ${error}`);
                    msg.push(`Error al actualizar la categoría - ${error}`);
                }
            });
    
            await Promise.all(updatePromises);
            return msg;
        } catch (error) {
            throw error;
        }
    }

    async  actualizarCategorias() {
        try {
            // Consulta la API para obtener los productos
            const response = await axios.get('https://tecnoshop-connect.im/api/productos');
            const productosAPI = response.data;
    
            for (const productoAPI of productosAPI) {
                const sku = productoAPI.sku;
                const idIngramCategoria = `BDI_${productoAPI.id_categoria}`;
    
                // Consulta la base de datos para obtener el producto con el SKU correspondiente
                const [productoBD] = await this.pool.query('SELECT * FROM ingramProductosv2 WHERE Sku_ingram = ?', [sku]);
    
                if (productoBD.length > 0) {
                    const producto = productoBD[0];
    
                    // Consulta las nuevas categorías y subcategorías
                    const [categorias_ID] = await this.pool.query('SELECT * FROM wooCategoriasNew2 WHERE id_ingram_Categorias = ?', [idIngramCategoria]);
    
                    if (categorias_ID.length > 0) {
                        const nuevaSubcategoria = categorias_ID[0].id_woocommerce;
                        const nuevaCategoriaPadre = parseInt(categorias_ID[0].id_parent_woocommerce, 10);
    
                        // Actualiza los IDs de las categorías si han cambiado
                        if (producto.id_categoria !== nuevaCategoriaPadre || producto.id_subcategoria !== nuevaSubcategoria) {
                            await this.pool.query('UPDATE ingramProductosv2 SET id_categoria = ?, id_subcategoria = ? WHERE Sku_ingram = ?', [nuevaCategoriaPadre, nuevaSubcategoria, sku]);
                            console.log(`Actualizado producto con SKU: ${sku}, nuevas categorías: ${nuevaCategoriaPadre}, ${nuevaSubcategoria}`);
                        }
                    }
                }
            }
            return 'Actualización de categorías completada.';
        } catch (error) {
            return `Error al actualizar categorías: ${error.message}`;
        }
    }
    
}

module.exports = PostProductosWoo