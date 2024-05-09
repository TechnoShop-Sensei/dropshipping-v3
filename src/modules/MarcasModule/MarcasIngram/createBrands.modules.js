const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlMarcasBDI } = require('../../../Helpers/helpsIngram/rutas.bdi')
const { urlCreateMarcasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');
const marcasSeleccionadasIngram = require('../../../Helpers/marcas');

class postMarcasBD {
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
            const queryInsert = `INSERT INTO ingramMarcas (Nombre_Marca_Ingram, id_bdi) VALUES (?, ?)`;
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
}

module.exports = postMarcasBD