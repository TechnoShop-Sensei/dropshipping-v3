const configIngram = require('./config.ingram.js')
const axios = require('axios');
const { urlTokenIngram } = require('../Helpers/rutas.ingram');
const pool = require('../database/conexion')

/* CREATE TOKEN */
class TokenIngram {

    // ? Crear Token Ingram - Acccion Generando Token y almacenar en BD
    async getTokenCreate(){
        try {
            const config = new configIngram();

            const ver = await config.clavesAjusteGeneralToken();
            const response = await axios.get(urlTokenIngram, { params: ver });

            const query  = `UPDATE ingramTokens SET Token_Ingram = '${ response.data.access_token }' WHERE id_token_Ingram = 1`;

            const [rows] = await pool.query(query);
            console.log(`Se actualizo ${ rows.affectedRows }`);

            return rows
        } catch (error) {
            throw error;
        }
    }

}

module.exports = TokenIngram;
