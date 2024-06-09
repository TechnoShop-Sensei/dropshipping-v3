const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const { urlUpdateCategoriasWoo, urlCreateCategoriasWoo } = require('../../../Helpers/rutas.woocomerce');
const axios = require('axios');

const chunks = require('chunk-array').chunks

class PutAndAddCategoriasWoo {
    constructor(pool) {
        this.pool = pool;
    }


    async postCategoriasInsertWoo() {
        try {
            const configHeader = new configAPIWoo();
            const config = await configHeader.clavesAjusteGeneral();
            const urlGetCategoriasWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/categories?search='; // URL base para obtener categorías

    
            // Consulta de categorías desde tu base de datos
            const querySelectCategorias = `SELECT * FROM wooCategoriasNew2`;
            const [rows] = await this.pool.query(querySelectCategorias);
    
            const nameCategoria = rows.map(categoria => {
                return {
                    name: categoria.Nombre_Categoria,
                    description: `El ID dependiente es: ${categoria.id_ingram_Categorias}`
                }
            });
    
            let categoriasRows = chunks(nameCategoria, 100);
            const msg = [];
    
            const promises = categoriasRows.map(async (categorias) => {
                try {
                    // Verificar cada categoría individualmente
                    for (const categoria of categorias) {
                        // Consultar si la categoría ya existe en WooCommerce
                        const response = await axios.get(`${urlGetCategoriasWoo}${encodeURIComponent(categoria.name)}`, config);
                        const categoriasExistentes = response.data;
    
                        // Si la categoría no existe, agregarla
                        if (!categoriasExistentes.some(cat => cat.name.toLowerCase() === categoria.name.toLowerCase())) {
                            const datos = {
                                create: [categoria]
                            };
    
                            const creandoCategoria = await axios.post(urlCreateCategoriasWoo, datos, config);
    
                            creandoCategoria.data.create.forEach(async create => {
                                const idCategoria = create.id;
                                const NombreCategoria = create.name;
    
                                const queryUpdate = `UPDATE wooCategoriasNew2 SET id_woocommerce = ? WHERE Nombre_Categoria = ?`;
                                const values = [idCategoria, NombreCategoria];
                                await this.pool.query(queryUpdate, values);
    
                                msg.push(`Se agregó una categoría: ${create.name}`);
                                console.log(`Se agregó una categoría: ${create.name}`);
                            });
                        } else {
                            msg.push(`La categoría ${categoria.name} ya existe en WooCommerce.`);
                            console.log(`La categoría ${categoria.name} ya existe en WooCommerce.`);
                        }
                    }
                } catch (error) {
                    console.error(`Error al cargar la categoría - ${error}`);
                    msg.push(`Error al cargar la categoría - ${error}`);
                }
            });
            await Promise.all(promises);
    
            return msg;
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