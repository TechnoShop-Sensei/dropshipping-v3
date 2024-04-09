const axios = require('axios');
const pool = require('../database/conexion')


class TokenAPI {

    get paramsTokenBDIApi(){
        return {
            username: 'tecnoshop',
            password: 'tecnoshop.08.19'
        }
    }

    async crearToken (){
        try {
            
            const response = await axios.post('https://tecnoshop-connect.im/api/token', this.paramsTokenBDIApi);

            const query  = `UPDATE ingramTokens SET Token_API = '${ response.data.token }' WHERE id_token_Ingram = 1`;

            const [rows] = await pool.query(query);
            console.log(`Se actualizo ${ rows.affectedRows }`);

            pool.end()
            return rows
        } catch (error) {
            throw error;
        }
    }


}

  const main = async() => {
        const Token = new TokenAPI()

        const token = await Token.crearToken()
        console.log('====================================');
        console.log(token);
        console.log('====================================');

    }

    main()

module.exports = TokenAPI