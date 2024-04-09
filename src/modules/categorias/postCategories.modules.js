const configAPIWoo = require('../../woo/config.woo');
const { urlCategoriasBDI } = require('../../Helpers/rutas.bdi')
const { urlCreateCategoriasWoo, urlupdateCategoriasWoo, urlUpdateCategoriasWoo } = require('../../Helpers/rutas.woocomerce');
const axios = require('axios');
const pool = require('../../database/conexion');
const categoriasSeleccionadas = require('../../Helpers/categorias');
const chunks = require('chunk-array').chunks
class PostCategorias {
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
        } else {
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

            return this.agregarCategorias(categorias);
            
        } catch (error) {
            console.error(error);
            throw new Error('Error al agregar categorías');
        }
    }


    async postCategoriasWoo(){
        try {
            const configHeader = new configAPIWoo();

            const config = await configHeader.clavesAjusteGeneral();

            const querySelect = `SELECT * FROM ingramCategorias`;
            const [rows] = await pool.query(querySelect);

            const categoriasList = rows.map(marca => {
                return {
                    name: marca.Nombre_Optimatizado_Categoria,
                    parent: marca.Parent
                }
            })

            let categoriasRows = chunks(categoriasList, 100);
            const msg = [];

            for (let categoriasChunk of categoriasRows) {
                try {
                    const datos = { create: categoriasChunk };
                    const creandoCategoria = await axios.post(urlCreateCategoriasWoo, datos, config);
                    
                    // Procesar las actualizaciones de la base de datos en lotes
                    for (let i = 0; i < creandoCategoria.data.create.length; i += 5) {
                        const batch = creandoCategoria.data.create.slice(i, i + 5);

                        await Promise.all(batch.map(async element => {
                            const idcategoria = element.id;
                            const nombreCategoria = element.name;
                            const queryUpdate = `Update ingramCategorias SET id_woocomerce_categoria = ? WHERE Nombre_Optimatizado_Categoria = ?`;
                            await this.pool.query(queryUpdate, [idcategoria, nombreCategoria]);
                            msg.push(`Se Actualizo una Marca con el ID: ${element.idcategoria}, Nombre: ${element.nombreCategoria}`);
                        }));

                    }
                    
                } catch (error) {
                    console.error(`Error al cargar producto - ${error}`);
                    msg.push(`Error al cargar producto - ${error}`);
                }
            }
            
            return msg

        } catch (error) {
            throw error;
        }
    }

    async updateCategoriaParentBD() {
        try {
            const querySelect = `SELECT * FROM ingramCategorias`;

            const [categoria] = await pool.query(querySelect)

            const parent = categoria.map((item) => {
                return {
                    id: item.id_woocomerce_categoria,
                    id_bdi: item.id_bdi,
                    parent: item.parent_bdi,
                    nombre: item.Nombre_Categoria_Ingram
                }
            });

            console.log(parent);

            const msg = [];
            

            for (const categorias of parent) {

                const parent_id = parseInt(categorias.parent)

                if(parent_id === 0){
                    // actualiza a 0 el que tenga el parent en 0
                    try {
                        const UpdateData = `UPDATE ingramCategorias SET Parent = 0 Where Nombre_Categoria_Ingram = '${ categorias.nombre }'`;

                        await pool.query(UpdateData);
                    } catch (error) {
                        throw error
                    }
                }else if(parent_id === 1){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 1`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 2){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 2`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 3){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 3`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 4){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 4`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 5){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 5`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 6){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 6`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 7){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 7`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 8){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 8`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 9){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 9`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 10){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 10`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 11){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 11`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }else if(parent_id === 12){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 12`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 13){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 13`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 14){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 14`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 15){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 15`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 16){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 16`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 17){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 17`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 18){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 18`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 19){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 19`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 20){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 20`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                else if(parent_id === 21){
                    try {
                        const querySelect = `SELECT * FROM ingramCategorias WHERE id_bdi = 21`;
                        const [rows] = await this.pool.query(querySelect);
                    
                        let parentValue;
                        if (rows.length > 0) {
                            // Si hay resultados, usa el id_woocomerce_categoria del resultado encontrado
                            parentValue = rows[0].id_woocomerce_categoria;
                        } else {
                            // Si no hay resultados, establece Parent a 0
                            parentValue = 0;
                        }
                    
                        const updateData = `UPDATE ingramCategorias SET Parent = ${parentValue} WHERE Nombre_Categoria_Ingram = '${categorias.nombre}'`;
                        await this.pool.query(updateData);
                    } catch (error) {
                        throw new Error(`Error al actualizar la categoría ${categorias.nombre}: ${error}`);
                    }
                }
                
            
            }

            
            
            return msg
        } catch (error) {
            throw error;
        }
    }

    async updateCategoriaParentWoo(){
        try {
            const configHeader = new configAPIWoo();

            const config = await configHeader.clavesAjusteGeneral();

            const consultaSelect = `SELECT * FROM ingramCategorias`;
    
            const [row] = await pool.query(consultaSelect)

            let msg = []

            const promise = row.map(async (parent) => {
                try {
                    const { id, Nombre } = parent
    
                    let data = {
                        parent: parent.Parent
                    }
    
                    await axios.put(`${urlUpdateCategoriasWoo}/${ id }`, data, config)
    
                    msg.push(`La Categoria ${ id } --- ${ Nombre } se ha Actualizado en Woocommerce`);
                } catch (error) {
                    msg.push(`Hubo un error en actualizar ${ parent.Nombre } --- ${ error}`);
                }
            });
            
            await Promise.all(promise)

            return msg;
        }catch(error){
            throw error
        }
    }
}

module.exports = PostCategorias