const pool = require('../../database/conexion')

class ConsumirApiRestWoo {
    get headerWoo(){
        return {
            'Content-Type': 'application/json' 
        }
    }

    async clavesAjusteGeneral (){
        const [row] = await pool.query('SELECT * FROM ingramTokens WHERE id_token_Ingram = 1');

        let CustomerKey = row[0].Token_CONSUMER_KEY_Woo;
        let CustomerSecret = row[0].Token_CONSUMER_SECRET_Woo;

        let ajustes = {
                headers: this.headerWoo,
                auth: {
                username: `${CustomerKey}`,
                password: `${CustomerSecret}`
            }
        }
        return ajustes
    }

    async clavesAjusteSinHeader (){
        const [row] = await pool.query('SELECT * FROM ingramTokens WHERE id_token_Ingram = 1');

        let CustomerKey = row[0].Token_CONSUMER_KEY_Woo;
        let CustomerSecret = row[0].Token_CONSUMER_SECRET_Woo;

        let ajustes = {
            auth: {
            username: `${CustomerKey}`,
            password: `${CustomerSecret}`
            }
        }
        return ajustes
    }

    async clavesAjusteListar (){
        const [row] = await pool.query('SELECT * FROM ingramTokens WHERE id_token_Ingram = 1');

        let CustomerKey = row[0].Token_CONSUMER_KEY_Woo;
        let CustomerSecret = row[0].Token_CONSUMER_SECRET_Woo;

        let ajustes = {
            params: {
                'per_page': 100
            },
            auth: {
            username: `${CustomerKey}`,
            password: `${CustomerSecret}`
            }
        }
        return ajustes
    }

   

}

module.exports = ConsumirApiRestWoo