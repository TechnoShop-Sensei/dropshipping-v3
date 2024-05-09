const configAPIWoo = require('../../woocommerce/configWooIngram/config.woo');
const { urlCategoriasBDI } = require('../../Helpers/helpsIngram/rutas.bdi')
const { urlCreateCategoriasWoo, urlupdateCategoriasWoo, urlUpdateCategoriasWoo } = require('../../Helpers/rutas.woocomerce');
const axios = require('axios');
const pool = require('../../database/conexion');
const categoriasSeleccionadas = require('../../Helpers/categorias');
const categoriasGenerales = require('../../Helpers/categoriasGenerales');
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

        }else {
            // Si no existe, inserta la nueva categoría
            const queryInsert = `INSERT INTO ingramCategorias (Nombre_Categoria_Ingram, id_bdi, parent_bdi, utilidad_por_Categoria) VALUES (?, ?, ?, 0)`;
            await this.pool.query(queryInsert, [data.nombre, data.id_categoria, data.parent_bdi]);
            return `SE HA AGREGADO UNA NUEVA CATEGORIA - ${data.nombre}`;
        }
    }

  // Método para eliminar categorías que ya no están en la lista seleccionada
async eliminarCategoriasNoSeleccionadas(categoriasSeleccionadas) {
    // Asumimos que 'categoriasEnBD' es una lista de objetos, cada uno con la propiedad 'Nombre_Categoria_Ingram'
    const categoriasEnBD = await this.pool.query('SELECT Nombre_Categoria_Ingram FROM ingramCategorias');
    
    // Filtramos para asegurarnos de que no manipulamos datos indefinidos
    const categoriasAEliminar = categoriasEnBD.filter(catBD => 
        catBD.Nombre_Categoria_Ingram && // Asegura que 'Nombre_Categoria_Ingram' no sea undefined
        !categoriasSeleccionadas.includes(catBD.Nombre_Categoria_Ingram.toUpperCase())
    );

    const promises = categoriasAEliminar.map(cat => this.eliminarCategoriaBD(cat.Nombre_Categoria_Ingram));
    const results = await Promise.all(promises);
    return results;
}

    // Método para eliminar una categoría específica de la base de datos
    async eliminarCategoriaBD(nombreCategoria) {
        const deleteQuery = `DELETE FROM ingramCategorias WHERE Nombre_Categoria_Ingram = ?`;
        await this.pool.query(deleteQuery, [nombreCategoria]);
        return `SE HA ELIMINADO LA CATEGORIA - ${nombreCategoria}`;
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

                // Eliminar categorías que ya no están seleccionadas
                const resultadosEliminar = await this.eliminarCategoriasNoSeleccionadas(categoriasSelect);
        
                return { resultadosAgregar, resultadosEliminar };
            
        } catch (error) {
            console.error(error.message);
            throw new Error('Error al agregar categorías');
        }
    }

    // ? Obtener Categoria General y Categorias Dependientes
    async categoriasSeleccionadas() {
        try {
            const datosAInsertar = [];
            const categoriaMap = new Map();
    
            // Recopilar información de la base de datos y mapear
            for (const categoriaGeneral of categoriasGenerales) {
                for (const idDependiente of categoriaGeneral.Dependencias) {
                    if (!categoriaMap.has(idDependiente)) {
                        const [rows] = await this.pool.query('SELECT * FROM ingramCategorias WHERE id_bdi = ?', [idDependiente]);
                        if (rows.length > 0) {
                            categoriaMap.set(idDependiente, rows[0].Nombre_Categoria_Ingram);
                        }
                    }
                }
            }
    
            // Procesar y preparar los datos para inserción o actualización
            for (const categoriaGeneral of categoriasGenerales) {
                let nombresDependientes = categoriaGeneral.Dependencias.map(id => categoriaMap.get(id) || id);
    
                // Convertir los arreglos a JSON para almacenamiento en MySQL
                let idsDependientesJSON = JSON.stringify(categoriaGeneral.Dependencias);
                let nombresDependientesJSON = JSON.stringify(nombresDependientes);
                

                 // Si la categoría no existe, insertar la nueva categoría
                 const queryInsert = 'INSERT INTO wooCategoriasNew (nombre_categoria_principal, id_categorias_dependientes, Nombre_Categorias_Dependientes) VALUES (?, ?, ?)';
                 await this.pool.query(queryInsert, [categoriaGeneral.name, idsDependientesJSON, nombresDependientesJSON]);
                 datosAInsertar.push(`Insertada: ${categoriaGeneral.name}`);
                    
            }
    
            return datosAInsertar;
        } catch (error) {
            console.error('Error al actualizar categorías:', error);
            throw error;
        }
    }
    

    // ? Agregar Categoria General y Obtner id
    async postCategoriasWoo(){
        try {
            const configHeader = new configAPIWoo();

            const config = await configHeader.clavesAjusteGeneral();


            const querySelect = `SELECT * FROM wooCategoriasNew`;
            const [rows] = await pool.query(querySelect);

            const nameCategoria = rows.map(marca => {
                return {
                    name: marca.nombre_categoria_principal,
                }
            })

            let categoriasRows = chunks(nameCategoria, 100);
            const msg = [];

            const promises =  categoriasRows.map(async (categorias)=> {
                try {
                    const datos = { 
                        create: categorias
                     };
                    
                    const creandoCategoria = await axios.post(urlCreateCategoriasWoo, datos, config);
                    
                    creandoCategoria.data.create.forEach(async element => {
                        
                        const idCategoria = element.id;
                        const NombreCategoria = element.name;

                        const queryUpdate = `Update wooCategoriasNew SET id_woocoommerce = ? WHERE nombre_categoria_principal = ?`;
                        const values = [idCategoria, NombreCategoria];
                        await pool.query(queryUpdate, values);

                        msg.push(`Se agrego un Categoria: ${ element.name }`)
                        console.log(`Se agrego un Categoria: ${ element.name }`);
                    });
                
                    
                } catch (error) {
                    console.error(`Error al cargar producto - ${error}`);
                    msg.push(`Error al cargar producto - ${error}`);
                }
            });
            await Promise.all(promises)

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

    async updateCategoriaParentWoo() {
        try {
            const configHeader = new configAPIWoo();
            const config = await configHeader.clavesAjusteGeneral();
            const querySelect = `SELECT * FROM wooCategoriasNew`;
            const [rows] = await this.pool.query(querySelect);
            const msg = [];
    
            for (const row of rows) {
                // Asumiendo que la columna es un JSON válido de nombres
                const nombresCategoriasDependientes = JSON.parse(row.Nombre_Categorias_Dependientes);

                console.log(nombresCategoriasDependientes);
    
                // Divide los nombres en lotes de 100
                const lotesDeNombres = chunks(nombresCategoriasDependientes, 100);
    
                const promise = lotesDeNombres.map(async (cat) => {

                
                    // Preparar el lote para la creación de categorías
                    const datosLote = cat.map(nombre => ({ name: nombre }));

                    const datos = { 
                        create: datosLote 
                    };
    
                    // try {
                    //     // Enviar el lote a WooCommerce
                    //     const response = await axios.post(urlCreateCategoriasWoo, datos, config);
                    //     const idsCreados = response.data.create.map(categoria => categoria.id);
    
                    //     // Concatenar los IDs creados a la lista actual de IDs dependientes
                    //     await this.pool.query(
                    //         `UPDATE wooCategoriasNew SET id_parent_woocoomerce = CONCAT(IFNULL(id_parent_woocoomerce,''),?) 
                    //         WHERE nombre_categoria_principal = ?`,
                    //         [idsCreados.join(',') + ',', row.nombre_categoria_principal]
                    //     );
    
                    //     msg.push(`Categorías creadas para el lote y actualizadas en la base de datos.`);
                    // } catch (error) {
                    //     msg.push(`Error al procesar el lote: ${error.message}`);
                    // }
                })

                await Promise.all(promise)

            }
    
            return msg;
        } catch (error) {
            console.error('Error al procesar categorías:', error);
            throw error;
        }
    }
    


    
    
    // async updateCategoriaParentWoo(){
    //     try {
    //         const configHeader = new configAPIWoo();

    //         const config = await configHeader.clavesAjusteGeneral();

    //         const consultaSelect = `SELECT * FROM ingramCategorias`;
    
    //         const [row] = await pool.query(consultaSelect)

    //         let msg = []

    //         const promise = row.map(async (parent) => {
    //             try {
    //                 const { id, Nombre } = parent
    
    //                 let data = {
    //                     parent: parent.Parent
    //                 }
    
    //                 await axios.put(`${urlUpdateCategoriasWoo}/${ id }`, data, config)
    
    //                 msg.push(`La Categoria ${ id } --- ${ Nombre } se ha Actualizado en Woocommerce`);
    //             } catch (error) {
    //                 msg.push(`Hubo un error en actualizar ${ parent.Nombre } --- ${ error}`);
    //             }
    //         });
            
    //         await Promise.all(promise)

    //         return msg;
    //     }catch(error){
    //         throw error
    //     }
    // }
}

module.exports = PostCategorias