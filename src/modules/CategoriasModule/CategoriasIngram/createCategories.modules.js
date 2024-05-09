const { urlCategoriasBDI } = require('../../../Helpers/helpsIngram/rutas.bdi')
const axios = require('axios');
const categoriasSeleccionadas = require('../../../Helpers/categorias');

class PostCategoriasBD {
    constructor(pool) {
        this.pool = pool;
    }
    
    // ? Metodo para agregar a base de datos
    async agregarCategoriaBD(data) {
        // Verifica primero si la categoría ya existe en la base de datos
        const checkQuery = `SELECT COUNT(*) AS count FROM ingramCategorias WHERE Nombre_Categoria_Ingram = ? AND id_bdi = ?`;
        const [checkResult] = await this.pool.query(checkQuery, [data.nombre, data.id_categoria]);

        if (checkResult[0].count > 0) {
            // La categoría ya existe, no necesita ser agregada de nuevo
            return `LA CATEGORIA YA EXISTE - ${data.nombre}`;

        }else {
            // Si no existe, inserta la nueva categoría
            const queryInsert = `INSERT INTO ingramCategorias (Nombre_Categoria_Ingram, id_bdi, parent_bdi, utilidad_por_Categoria) VALUES (?, ?, ?, 0)`;
            await this.pool.query(queryInsert, [data.nombre, data.id_categoria, data.parent_bdi]);
            return `SE HA AGREGADO UNA NUEVA CATEGORIA - ${data.nombre}`;
        }
    }

    // ? Optimizar el Consumo querys de Connetions para Mysql = Connection 10
    async agregarCategorias(categorias) {
        const batchSize = 5;
        let results = [];

        for (let i = 0; i < categorias.length; i += batchSize) {
            const batch = categorias.slice(i, i + batchSize);
            try {
                const promises = batch.map(data => this.agregarCategoriaBD(data));
                const batchResults = await Promise.all(promises);
                results.push(...batchResults);
                
            } catch (error) {
                console.error(`Error al procesar el lote: ${error}`);
                // Continúa con el siguiente lote incluso si hay un error
            }
        }

        return results;
    }

    async ejecutar() {
        try {
            const response = await axios.get(urlCategoriasBDI);
            const categoriasSelect = categoriasSeleccionadas.map(categoria => categoria.toUpperCase());
            
            const categorias = response.data.categorias
                .filter(item => categoriasSelect.includes(item.category.toUpperCase().trim()))
                .map(item => ({
                    nombre: item.category,
                    id_categoria: item.id,
                    parent_bdi: item.parent_id
                }));

                const resultadosAgregar = await this.agregarCategorias(categorias);
                
                return resultadosAgregar ;
            
        } catch (error) {
            console.error(error.message);
            throw new Error('Error al agregar categorías');
        }
    }



}

module.exports = PostCategoriasBD