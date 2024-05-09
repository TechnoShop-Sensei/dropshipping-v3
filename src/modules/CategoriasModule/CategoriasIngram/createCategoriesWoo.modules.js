const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlCreateCategoriasWoo, urlupdateCategoriasWoo, urlUpdateCategoriasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');
const pool = require('../../../database/conexion');

const chunks = require('chunk-array').chunks

class PostCategoriasBD {
    constructor(pool) {
        this.pool = pool;
    }


// ? Agregar Categoria General a Woocommerce y Obtener ID
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

}

module.exports = PostCategoriasBD