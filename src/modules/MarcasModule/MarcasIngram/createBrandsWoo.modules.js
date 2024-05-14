const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlMarcasBDI } = require('../../../Helpers/helpsIngram/rutas.bdi')
const { urlCreateMarcasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');
const chunks = require('chunk-array').chunks

class postMarcasIdentify {
    constructor(pool) {
        this.pool = pool;
    }

    async AgregarMarcasWoo() {
        try {
            const configHeaders = new configAPIWoo();
            const config = await configHeaders.clavesAjusteGeneral();
            const querySelect = `SELECT * FROM wooMarcasNew`
            const [rows] = await this.pool.query(querySelect);
    
            const marcasList = rows.map(marca => {
                return { 
                    name: marca.Nombre_Marca_Principal 
                }
            });
    
            let msg = [];
            let marcasRows = chunks(marcasList, 100); 
    
            const tasks = marcasRows.map(async (marcasChunk) => { // Primero mapeamos cada chunk a una promesa
                try {
                    const datos = { create: marcasChunk };
                    const creandoMarca = await axios.post(urlCreateMarcasWoo, datos, config);
    
                    const updatePromises = creandoMarca.data.create.map(async (element) => { // Mapeamos cada creación a una promesa de actualización
                        const idmarca = element.id;
                        const nombreMarca = element.name;
                        const queryUpdate = `UPDATE wooMarcasNew SET id_woocommerce = ? WHERE Nombre_Marca_Principal = ?`;
                        await this.pool.query(queryUpdate, [idmarca, nombreMarca]);
                        return `Se Agrego una Marca con el ID: ${idmarca}, Nombre: ${nombreMarca}`;
                    });
    
                    const results = await Promise.all(updatePromises);
                    msg.push(...results);
                } catch (error) {
                    console.error(`Error al cargar producto - ${error}`);
                    msg.push(`Error al cargar producto - ${error}`);
                }
            });
    
            await Promise.all(tasks); // Esperamos a que todas las tareas de los chunks finalicen
            return msg;
        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = postMarcasIdentify