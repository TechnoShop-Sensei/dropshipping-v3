const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlCategoriasBDI } = require('../../../Helpers/helpsIngram/rutas.bdi')
const { urlCreateCategoriasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');

const chunks = require('chunk-array').chunks
class postCategoriasParent {
    constructor(pool) {
        this.pool = pool;
    }


    async updateWooCommerceParentID() {
        try {
            // Obtain records that start with 'BDI_%' from wooCategoriasNew2
            const querySelectWoo = `
                SELECT 
                wc.id_wooCategoriaNew,
                wc.nombre_categoria_principal,
                w2.id_ingram_Categorias,
                w2.Nombre_Categoria
            FROM 
                wooCategoriasNew wc
            JOIN 
                wooCategoriasNew2 w2 
            ON 
                FIND_IN_SET(SUBSTRING(w2.id_ingram_Categorias, LOCATE('_', w2.id_ingram_Categorias) + 1), REPLACE(REPLACE(wc.id_categorias_dependientes, '[', ''), ']', '')) > 0
            WHERE 
                w2.id_ingram_Categorias LIKE 'BDI_%'
            ORDER BY 
                wc.nombre_categoria_principal ASC`;

            const [categoriasBDI] = await this.pool.query(querySelectWoo);
    
            // Crear un objeto para contar las repeticiones
            const repetitionCounter = {};
                categoriasBDI.forEach(categoria => {
                    repetitionCounter[categoria.id_ingram_Categorias] = (repetitionCounter[categoria.id_ingram_Categorias] || 0) + 1;
                });

            const promises = categoriasBDI.map(async (categoria) => {
                const count = repetitionCounter[categoria.id_ingram_Categorias];

                if (count === 1) {
                    console.log(categoria.id_ingram_Categorias);
                    const id_woocommerce = await this.getIdWooCommerce(categoria, this.pool);
                    await this.pool.query(`UPDATE wooCategoriasNew2 SET id_parent_woocommerce = ? WHERE id_ingram_Categorias = ?`, [id_woocommerce, categoria.id_ingram_Categorias]);
                }
                if (count === 2) {
                    console.log(categoria.id_ingram_Categorias);
                    const id_woocommerce_2 = await this.getIdWooCommerce2(categoria, this.pool);
                    await this.pool.query(`UPDATE wooCategoriasNew2 SET id_parent_woocommerce_2 = ? WHERE id_ingram_Categorias = ?`, [id_woocommerce_2, categoria.id_ingram_Categorias]);
                }
                if (count === 3) {
                    console.log(categoria.id_ingram_Categorias);
                    const id_woocommerce_3 = await this.getIdWooCommerce3(categoria, this.pool);
                    await this.pool.query(`UPDATE wooCategoriasNew2 SET id_parent_woocommerce_3 = ? WHERE id_ingram_Categorias = ?`, [id_woocommerce_3, categoria.id_ingram_Categorias]);
                }

            });
    
            const results = await Promise.all(promises);

            return results; 
    
        } catch (error) {
            console.error('Error updating WooCommerce parent ID:', error.message);
        }
    }

    async getIdWooCommerce(categoria, pool) {
        // Construye el ID de categoría padre a buscar usando id_wooCategoriaNew
        const parentId = `TECH_${categoria.id_wooCategoriaNew}_ID`;
    
        // Consulta para obtener el id_woocommerce correspondiente a la categoría padre
        const query = `
            SELECT id_woocommerce
            FROM wooCategoriasNew2
            WHERE id_ingram_Categorias = ?`;
    
        const [results] = await pool.query(query, [parentId]);
        return results.length > 0 ? results[0].id_woocommerce : null;
    }
    
    async getIdWooCommerce2(categoria, pool) {
        // Asumimos que hay una lógica similar para el segundo nivel si es necesario
        const parentId = `TECH_${categoria.id_wooCategoriaNew}_ID`;
    
        const query = `
            SELECT id_woocommerce
            FROM wooCategoriasNew2
            WHERE id_ingram_Categorias = ?`;
    
        const [results] = await pool.query(query, [parentId]);
        return results.length > 0 ? results[0].id_woocommerce : null;
    }
    
    async getIdWooCommerce3(categoria, pool) {
        // Y para el tercer nivel, si aplica
        const parentId = `TECH_${categoria.id_wooCategoriaNew}_ID`;
    
        const query = `
            SELECT id_woocommerce
            FROM wooCategoriasNew2
            WHERE id_ingram_Categorias = ?`;
    
        const [results] = await pool.query(query, [parentId]);
        return results.length > 0 ? results[0].id_woocommerce : null;
    }
    
    

    async countCategoryRepetitions() {
        try {
            // Tu consulta SQL original
            const querySelectWoo = `
                SELECT 
                wc.id_wooCategoriaNew,
                wc.nombre_categoria_principal,
                w2.id_ingram_Categorias,
                w2.Nombre_Categoria
            FROM 
                wooCategoriasNew wc
            JOIN 
                wooCategoriasNew2 w2 
            ON 
                FIND_IN_SET(SUBSTRING(w2.id_ingram_Categorias, LOCATE('_', w2.id_ingram_Categorias) + 1), REPLACE(REPLACE(wc.id_categorias_dependientes, '[', ''), ']', '')) > 0
            WHERE 
                w2.id_ingram_Categorias LIKE 'BDI_%'
            ORDER BY 
                wc.nombre_categoria_principal ASC`;
    
            // Ejecutar la consulta y obtener los resultados
            const [categoriasBDI] = await this.pool.query(querySelectWoo);
    
            // Objeto para contar las repeticiones
            const repetitionCounter = {};
    
            // Recorrer cada categoría y contar las repeticiones
            categoriasBDI.forEach(categoria => {
                // Incrementar el contador para cada id_ingram_Categorias encontrado
                repetitionCounter[categoria.id_ingram_Categorias] = (repetitionCounter[categoria.id_ingram_Categorias] || 0) + 1;
            });
    
            // Aquí puedes ver los resultados de las repeticiones
            console.log('Repetition counts:', repetitionCounter);
    
            // Aquí decidirías qué hacer basado en los conteos, por ejemplo, imprimir qué categorías necesitan actualización
            Object.keys(repetitionCounter).forEach(key => {
                if (repetitionCounter[key] > 2) {
                    console.log(`Categoria ${key} se repite más de dos veces y tiene ${repetitionCounter[key]} repeticiones.`);
                }
            });
    
            // Devuelve el contador de repeticiones si necesitas utilizarlo en otra parte del código
            return repetitionCounter;
    
        } catch (error) {
            console.error('Error counting category repetitions:', error.message);
            throw error; // Propagar el error para un manejo adecuado
        }
    }
    
}

module.exports = postCategoriasParent