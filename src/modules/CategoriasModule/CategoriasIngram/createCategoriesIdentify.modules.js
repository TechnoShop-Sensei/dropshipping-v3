class postCategoriasIdentify {
    constructor(pool) {
        this.pool = pool;
    }

    async createCategoriasIdentifyBDI() {
        try {
            const querySelect = 'SELECT id_bdi, Nombre_Optimatizado, Nombre_Categoria_Ingram FROM ingramCategorias';
            const [rows] = await this.pool.query(querySelect);
    
            // TODO: Recorre la lista de Categorias
            const promises = rows.map(async (categoria) => {

                const id_ingram_Categorias = `BDI_${categoria.id_bdi}`;
                const queryCheckExistence = 'SELECT COUNT(*) AS count, Nombre_Categoria FROM wooCategoriasNew2 WHERE id_ingram_Categorias = ?';
                const [existResults] = await this.pool.query(queryCheckExistence, [id_ingram_Categorias]);
    
                if (existResults[0].count === 0) { // Check if category does not already exist
                    let Nombre_categoria_Principal = categoria.Nombre_Optimatizado && categoria.Nombre_Optimatizado.length > 0
                        ? categoria.Nombre_Optimatizado
                        : categoria.Nombre_Categoria_Ingram; 

                    const queryInsert = 'INSERT INTO wooCategoriasNew2 (id_ingram_Categorias, Nombre_Categoria, Utilidad_por_Categoria) VALUES (?, ?, ?)';
                    await this.pool.query(queryInsert, [id_ingram_Categorias, Nombre_categoria_Principal, 0]);
                    return queryInsert;
                } else {
                     // Si la categoría existe, comparar el nombre y actualizar si es diferente
                     const currentName = existResults[0].Nombre_Categoria;
                     let updatedName = categoria.Nombre_Optimatizado && categoria.Nombre_Optimatizado.length > 0
                         ? categoria.Nombre_Optimatizado
                         : categoria.Nombre_Categoria_Ingram;

                        if (currentName !== updatedName) {
                            const queryUpdate = 'UPDATE wooCategoriasNew2 SET Nombre_Categoria = ? WHERE id_ingram_Categorias = ?';
                            await this.pool.query(queryUpdate, [updatedName, id_ingram_Categorias]);
                            console.log(`Updated category name for ID ${id_ingram_Categorias} to ${updatedName}`);
                        } else {
                            console.log(`Category with ID ${id_ingram_Categorias} already exists with the same name.`);
                        }
                        return null;
                }
            });
    
            await Promise.all(promises);
    
        } catch (error) {
            console.error(error.message);
        }
    }

    async createCategoriasPrincipales() {
        try {
            // Fetching existing categories from wooCategoriasNew
            const querySelectWoo = 'SELECT id_wooCategoriaNew, nombre_categoria_principal FROM wooCategoriasNew';
            const [existingCategories] = await this.pool.query(querySelectWoo);
    
            const promises = existingCategories.map(async (categoria) => {
                const id_wooCategoriaNew = `TECH_${categoria.id_wooCategoriaNew}_ID`;
                const queryCheckExistence = 'SELECT COUNT(*) AS count, Nombre_Categoria FROM wooCategoriasNew2 WHERE id_ingram_Categorias = ?';
                const [existResults] = await this.pool.query(queryCheckExistence, [id_wooCategoriaNew]);
    
                if (existResults[0].count === 0) { // Check if the category does not already exist
                    
                    const queryInsert = 'INSERT INTO wooCategoriasNew2 (id_ingram_Categorias, Nombre_Categoria, Utilidad_por_Categoria) VALUES (?, ?, ?)';
                    await this.pool.query(queryInsert, [id_wooCategoriaNew, categoria.nombre_categoria_principal, 0]);
                    return queryInsert;
                } else {
                     // Si la categoría existe, comparar el nombre y actualizar si es diferente
                    const currentName = existResults[0].Nombre_Categoria;
                    let updatedName = categoria.nombre_categoria_principal && categoria.nombre_categoria_principal.length > 0
                        ? categoria.nombre_categoria_principal
                        : currentName;

                    if (currentName !== updatedName) {
                        const queryUpdate = 'UPDATE wooCategoriasNew2 SET Nombre_Categoria = ? WHERE id_ingram_Categorias = ?';
                        await this.pool.query(queryUpdate, [updatedName, id_wooCategoriaNew]);
                        console.log(`Updated category name for ID ${id_wooCategoriaNew} to ${updatedName}`);
                    } else {
                        console.log(`Category with ID ${id_wooCategoriaNew} already exists with the same name.`);
                    }
                    return null;
                }
            });
    
            await Promise.all(promises);
    
        } catch (error) {
            console.error(error.message);
        }
    }
    
    
}

module.exports = postCategoriasIdentify