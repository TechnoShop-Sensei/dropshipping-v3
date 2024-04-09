const configAPIWoo = require('../../woo/config.woo');
const { urlMarcasBDI } = require('../../Helpers/rutas.bdi')
const { urlCreateMarcasWoo } = require('../../Helpers/rutas.woocomerce');
const axios = require('axios');
const pool = require('../../database/conexion');
const marcasSeleccionadasIngram = require('../../Helpers/marcas');

class postMarcasWoo {
    constructor(pool) {
        this.pool = pool;
    }

    async agregarMarcasBD(data) {
        // Verifica primero si la categoría ya existe en la base de datos
        const checkQuery = `SELECT COUNT(*) AS count FROM ingramMarcas WHERE Nombre_Marca_Ingram = ? AND id_bdi = ?`;
        const [checkResult] = await this.pool.query(checkQuery, [data.nombre, data.id_marca]);

        if (checkResult[0].count > 0) {
            // La categoría ya existe, no necesita ser agregada de nuevo
            return `LA MARCA YA EXISTE - ${data.nombre}`;
        } else {
            // Si no existe, inserta la nueva categoría
            const queryInsert = `INSERT INTO ingramMarcas (Nombre_Marca_Ingram, id_bdi, Utilidad_por_Marca) VALUES (?, ?, 0)`;
            await this.pool.query(queryInsert, [data.nombre, data.id_marca]);
            return `SE HA AGREGADO UNA NUEVA MARCA - ${data.nombre}`;
        }
    }

      // ? Optimizar el Consumo querys de Connetions para Mysql = Connection 10
      async agregarMarca(marca) {
        const batchSize = 5;
        let results = [];

        for (let i = 0; i < marca.length; i += batchSize) {
            const batch = marca.slice(i, i + batchSize);
            try {
                const promises = batch.map(data => this.agregarMarcasBD(data));
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
            const response = await axios.get(urlMarcasBDI);
            const marcasSelect = marcasSeleccionadasIngram.map(marcas => marcas.toUpperCase());
            
            const marcas = response.data.marcas
                .filter(item => marcasSelect.includes(item.brand.toUpperCase().trim()))
                .map(item => ({
                    nombre: item.brand,
                    id_marca: item.id,
                }));

            return this.agregarMarca(marcas);
            
        } catch (error) {
            console.error(error);
            throw new Error('Error al agregar Marcas BDI');
        }
    }

    async AgregarMarcasWoo(){
        try {
            const configHeaders = new configAPIWoo();

            const config = await configHeaders.clavesAjusteGeneral();

            const querySelect = `SELECT * FROM ingramMarcas`

            const [rows] = await pool.query(querySelect);

            const marcasList = rows.map(marca => {
                return {
                    name: marca.Nombre_Optimatizado
                }
            })

            let msg = [];

            let marcasRows = chunks(marcasList, 100); 

            for (let marcasChunk of marcasRows) {
                try {
                    const datos = { create: marcasChunk };
                    const creandoMarca = await axios.post(urlCreateMarcasWoo, datos, config);
                    
                    // Procesar las actualizaciones de la base de datos en lotes
                    for (let i = 0; i < creandoMarca.data.create.length; i += 5) {
                        const batch = creandoMarca.data.create.slice(i, i + 5);
                        await Promise.all(batch.map(async element => {
                            const idmarca = element.id;
                            const nombreMarca = element.sku;
                            const queryUpdate = `Update ingramMarcas SET id_woocomerce_marca = ? WHERE Nombre_Optimatizado = ?`;
                            await this.pool.query(queryUpdate, [idmarca, nombreMarca]);
                            msg.push(`Se Actualizo una Marca con el ID: ${element.idmarca}, Nombre: ${element.nombreMarca}`);
                        }));
                    }
                } catch (error) {
                    console.error(`Error al cargar producto - ${error}`);
                    msg.push(`Error al cargar producto - ${error}`);
                }
            }

            return msg
        } catch (error) {
            throw error
        }
    }
}

module.exports = postMarcasWoo