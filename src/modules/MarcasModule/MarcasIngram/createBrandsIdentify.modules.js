const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlMarcasBDI } = require('../../../Helpers/helpsIngram/rutas.bdi')
const { urlCreateMarcasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');

class postMarcasIdentify {
    constructor(pool) {
        this.pool = pool;
    }

    async createMarcasIdentifyBDI (){
        try {
            const querySelect = 'SELECT id_bdi, Nombre_Optimatizado FROM ingramMarcas';
            const [rows] = await this.pool.query(querySelect);

            const promises = rows.map(async(marca) => {
                const id_ingram_Marcas = `BDI_${marca.id_bdi}`;
                const Nombre_Marca_Principal = marca.Nombre_Optimatizado;
                const queryInsert = 'INSERT INTO wooMarcasNew (id_ingram_Marcas, Nombre_Marca_Principal, Utilidad_por_Marca) VALUES (?, ?, ?)';
                await this.pool.query(queryInsert, [id_ingram_Marcas, Nombre_Marca_Principal, 0]);
                return queryInsert
            });

            await Promise.all(promises);

        } catch (error) {
            console.error(error.message);
        }
    }
}

module.exports = postMarcasIdentify