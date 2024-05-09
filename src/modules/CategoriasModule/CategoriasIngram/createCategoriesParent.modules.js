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
            const querySelectBDI = `
                SELECT id_ingram_Categorias, Nombre_Categoria FROM wooCategoriasNew2
                WHERE id_ingram_Categorias LIKE 'BDI_%'`;
            const [categoriasBDI] = await this.pool.query(querySelectBDI);
    
            const promises = categoriasBDI.map(async (categoriaBDI) => {
                // Remove special character and obtain the base ID
                const idBase = categoriaBDI.id_ingram_Categorias.replace('BDI_', '');
    
                // Check in wooCategoriasNew if the base ID is within id_categorias_dependientes
                const querySelectWoo = `
                    SELECT nombre_categoria_principal, id_categorias_dependientes FROM wooCategoriasNew
                    WHERE JSON_CONTAINS(id_categorias_dependientes, '"${idBase}"')`;
                const [categoriesWoo] = await this.pool.query(querySelectWoo);
    
                if (categoriesWoo.length === 0) {
                    // If no matching categories are found, set 'TECH_' categories to parent ID 0
                    const queryUpdateTech = `
                        UPDATE wooCategoriasNew2
                        SET id_parent_woocommerce = 0
                        WHERE id_ingram_Categorias LIKE 'TECH_%'`;
                    await this.pool.query(queryUpdateTech);
                } else {
                    for (const categoryWoo of categoriesWoo) {
                        if (categoriaBDI.Nombre_Categoria === categoryWoo.nombre_categoria_principal) {
                            // Update categories in wooCategoriasNew2 that start with 'TECH_'
                            const querySelectTech = `
                                SELECT id_woocommerce FROM wooCategoriasNew2
                                WHERE Nombre_Categoria = ? AND id_ingram_Categorias LIKE 'TECH_%'`;
                            const [techCategories] = await this.pool.query(querySelectTech, [categoryWoo.nombre_categoria_principal]);
    
                            techCategories.forEach(async (techCategory) => {
                                const queryUpdate = `
                                    UPDATE wooCategoriasNew2
                                    SET id_parent_woocommerce = ?
                                    WHERE id_woocommerce = ?`;
                                await this.pool.query(queryUpdate, [techCategory.id_woocommerce, categoriaBDI.id_ingram_Categorias]);
                            });
                        }
                    }
                }
            });
    
            await Promise.all(promises);
    
        } catch (error) {
            console.error('Error updating WooCommerce parent ID:', error.message);
        }
    }
    
}

module.exports = postCategoriasParent