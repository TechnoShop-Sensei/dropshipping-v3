class postCategoriasIdentify {
    constructor(pool) {
        this.pool = pool;
    }

    async createCategoriasIdentifyBDI() {
        try {
            const querySelect = 'SELECT id_bdi, Nombre_Optimatizado, Nombre_Categoria_Ingram FROM ingramCategorias';
            const [rows] = await this.pool.query(querySelect);
    
            const promises = rows.map(async (categoria) => {
                const id_ingram_Categorias = `BDI_${categoria.id_bdi}`;
                const queryCheckExistence = 'SELECT COUNT(*) AS count FROM wooCategoriasNew2 WHERE id_ingram_Categorias = ?';
                const [existResults] = await this.pool.query(queryCheckExistence, [id_ingram_Categorias]);
    
                if (existResults[0].count === 0) { // Check if category does not already exist
                    let Nombre_categoria_Principal = categoria.Nombre_Categoria_Ingram; // Default to Nombre_Categoria_Ingram if Nombre_Optimatizado is empty
                    if (categoria.Nombre_Optimatizado && categoria.Nombre_Optimatizado.length > 0) {
                        Nombre_categoria_Principal = categoria.Nombre_Optimatizado; // Use Nombre_Optimatizado if available
                    }
                    const queryInsert = 'INSERT INTO wooCategoriasNew2 (id_ingram_Categorias, Nombre_Categoria, Utilidad_por_Categoria) VALUES (?, ?, ?)';
                    await this.pool.query(queryInsert, [id_ingram_Categorias, Nombre_categoria_Principal, 0]);
                    return queryInsert;
                } else {
                    console.log(`Category con el ID ${id_ingram_Categorias} Ya existe.`);
                    return null; // Return null or appropriate value if the category already exists
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
                const queryCheckExistence = 'SELECT COUNT(*) AS count FROM wooCategoriasNew2 WHERE id_ingram_Categorias = ?';
                const [existResults] = await this.pool.query(queryCheckExistence, [id_wooCategoriaNew]);
    
                if (existResults[0].count === 0) { // Check if the category does not already exist
                    const queryInsert = 'INSERT INTO wooCategoriasNew2 (id_ingram_Categorias, Nombre_Categoria, Utilidad_por_Categoria) VALUES (?, ?, ?)';
                    await this.pool.query(queryInsert, [id_wooCategoriaNew, categoria.nombre_categoria_principal, 0]);
                    return queryInsert;
                } else {
                    console.log(`Category with ID ${id_wooCategoriaNew} already exists.`);
                    return null; // Return null or appropriate value if the category already exists
                }
            });
    
            await Promise.all(promises);
    
        } catch (error) {
            console.error(error.message);
        }
    }
    
    
}

module.exports = postCategoriasIdentify