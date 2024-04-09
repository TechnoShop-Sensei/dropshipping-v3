const pool = require('../database/conexion')

class ConsumirApiRestIngram {

    // ? Parameters Price Avalibility
    get paramsIngramPriceAvalibity(){
        return {
            includeAvailability: 'true',
            includePricing: 'true',
            includeProductAttributes : 'true'
        }
    }

    // ?  Para Utilizar Token Ajustes
    async clavesAjusteGeneralToken (){
        const [row] = await pool.query('SELECT * FROM ingramTokens WHERE id_token_Ingram = 1');

        let CustomerKey = row[0].Token_CLIENT_ID;
        let CustomerSecret = row[0].Token_CLIENT_SECRET;

        let ajustes = {
            'grant_type': 'client_credentials',
            'client_id': `${CustomerKey}`,
            'client_secret': `${CustomerSecret}`
        }

        return ajustes
    }

    // ! Details - Fichas Tecnicas JSON
    async configHeaderGeneralDETAILS(){

        const [row] = await pool.query('SELECT * FROM ingramTokens');

        let TokenIngram = row[0].Token_Ingram;
        let CustomerNumber = row[0].Customer_Number_Ingram;

        let ajustes = {
            headers: { 
                'IM-CustomerNumber': `${CustomerNumber}`, 
                'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c508457f219-bw0a102j',
                'IM-CountryCode': 'MX',
                'IM-SenderID': 'Blue Diamond Retail',
                Authorization: `Bearer ${ TokenIngram }`,
              }
            

        }

        return ajustes;
    }

    // ? Config sin Params - Para Ajustes JSON
    async configHeaderGeneralSinParams(){

        const [row] = await pool.query('SELECT * FROM ingramTokens');

        let TokenIngram = row[0].Token_Ingram;
        let CustomerNumber = row[0].Customer_Number_Ingram;

        let ajustes = {
            headers: { 
                'IM-CustomerNumber': `${CustomerNumber}`, 
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c5084', 
                Authorization: `Bearer ${ TokenIngram }`
                //'Accept': 'application/json'
              }
        }

        return ajustes;
    }

    //!No Correr
    // TODO: Configuracion de Ordenes Produccion - Branch V10, Branch V5, Branch V3
    async configGeneralOrders(){

        // const [row] = await pool.query('SELECT * FROM ingramTokens WHERE id = 1');

        // let TokenIngram = row[0].Token_Ingram;
        // let CustomerNumber = row[0].CustomerNumber;

        // let ajustes = {
        //     headers: { 
        //         'Content-Type': 'application/json',
        //         'IM-CustomerNumber': `${CustomerNumber}`, 
        //         'IM-CountryCode': 'MX',
        //         'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c5084', 
        //         Authorization: `Bearer ${ TokenIngram }`
        //       }
            
        // }

        let ajustes = {
            headers: { 
                'Content-Type': 'application/json',
                'IM-CustomerNumber': `10-728940`, 
                'IM-CountryCode': 'MX',
                'IM-CorrelationID': 'fbac82ba-cf0a-4bcf-fc03-0c5084', 
                Authorization: `Bearer GOMO8vsclBlFuXZfsORCH4ysRtAY`
              }
        }


        return ajustes;
    }

}

module.exports = ConsumirApiRestIngram