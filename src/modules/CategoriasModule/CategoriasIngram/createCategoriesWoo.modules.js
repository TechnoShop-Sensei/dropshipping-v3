const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlUpdateCategoriasWoo, urlCreateCategoriasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');

const chunks = require('chunk-array').chunks

class PutAndAddCategoriasWoo {
    constructor(pool) {
        this.pool = pool;
    }


// ? Agregar Categoria General a Woocommerce y Obtener ID
    async postCategoriasInsertWoo(){
        try {
            const configHeader = new configAPIWoo();

            const config = await configHeader.clavesAjusteGeneral();

            const querySelectCategorias = `SELECT * FROM wooCategoriasNew2`;
            const [rows] = await this.pool.query(querySelectCategorias);

            const nameCategoria = rows.map(categoria => {
                return {
                    name: categoria.Nombre_Categoria,
                    description: `El ID dependiente es: ${categoria.id_ingram_Categorias}`
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
                    
                    creandoCategoria.data.create.forEach(async create => {
                        
                        const idCategoria = create.id;
                        const NombreCategoria = create.name;

                        const queryUpdate = `Update wooCategoriasNew2 SET id_woocommerce = ? WHERE Nombre_Categoria = ?`;
                        const values = [idCategoria, NombreCategoria];
                        await this.pool.query(queryUpdate, values);

                        msg.push(`Se agrego un Categoria: ${ create.name }`)
                        console.log(`Se agrego un Categoria: ${ create.name }`);
                    });
                
                    
                } catch (error) {
                    console.error(`Error al cargar la Categoria - ${error}`);
                    msg.push(`Error al cargar la Categoria - ${error}`);
                }
            });
            await Promise.all(promises)

            return msg

        } catch (error) {
            throw error;
        }
    }

    // ? Actualizar Categorias en Woocommerce si tienen Parent
    async postCategoriasUpdateWoo(){
        try {
            const configHeader = new configAPIWoo();

            const config = await configHeader.clavesAjusteGeneral();


            const querySelectUpdate = `SELECT * FROM wooCategoriasNew2`;
            const [rows] = await this.pool.query(querySelectUpdate);

            const nameCategoria = rows.map(categoria => {
                return {
                    id: categoria.id_woocommerce,
                    parent: categoria.id_parent_woocommerce
                }
            })

            let categoriasRows = chunks(nameCategoria, 100);
            const msg = [];

            const promises =  categoriasRows.map(async (categorias)=> {
                try {
                    const datos = { 
                        update: categorias
                    };
                    
                    const actualizandoCategoria = await axios.post(urlUpdateCategoriasWoo, datos, config);
                    
                    msg.push(`Se Actualizo una Categoria: ${ actualizandoCategoria.data.update.id }`)
                    console.log(`Se Actualizo una Categoria: ${ actualizandoCategoria.data.update.id }`);
                
                    
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

module.exports = PutAndAddCategoriasWoo