const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlProductosBDI } = require('../../../Helpers/helpsIngram/rutas.bdi');
const { urlCreateProductWoo, urlUpdateProductWoo } = require('../../../Helpers/rutas.woocomerce');
const { urlPricesIngram } = require('../../../Helpers/helpsIngram/rutas.ingram');

const axios = require('axios');
const pool = require('../../../database/conexion');
const chunks = require('chunk-array').chunks
const {abreviarYTraducir, procesarTexto, Uppercase, AgregarMarcaTitulo} = require('../../../Helpers/setNameProduct')

// Solo Realiza Acciones de Woo
class PostProductosWoo {
    constructor(pool){
        this.pool = pool;
    }

    async agregarProductosWoo () {
        try {
            const configHeader = new configAPIWoo();
            const config = await configHeader.clavesAjusteGeneral();
            const querySelect = `SELECT * FROM ingramProductosv2 as pr INNER JOIN wooMarcasNew as mr on pr.id_marca = mr.id_woocommerce`;
            const [rows] = await this.pool.query(querySelect);

            const productosList = rows.map(products => {
                return {
                    name: products.Nombre,
                    sku: products.Sku_ingram,
                    status: products.Status_Woocommerce,
                    catalog_visibility: products.Catalog_visibility_Woo,
                    regular_price: products.Precio_Final,
                    tax_status: "taxable",
                    manage_stock: true,
                    stock_quantity: products.Cantidad,
                    stock_status: "outofstock",
                    backorders: "no",
                    reviews_allowed: false,
                    low_stock_amount: 1,
                    weight: products.Peso,
                    dimensions: {

                        length: products.Longitud,
                        width: products.Ancho,
                        height: products.Altura
                    },
                    categories: [
                        {
                            id: products.id_categoria
                        },
                        {
                            id: products.id_subcategoria
                        }
                    ],
                    attributes: [
                        {
                            id: 3,
                            name: "Marcas",
                            position: 0,
                            visible: true,
                            variation: false,
                            options: [
                                products.Nombre_Marca_Principal
                            ]
                        }
                    ]    
                }
            });

            let productosRows = chunks(productosList, 100);


            console.log(productosRows);


            let msg = [];

            msg.push(productosRows)
    
            // for (let productsChunk of productosRows) {
            //     try {
            //         const datos = { 
            //             create: productsChunk 
            //         };
            //         const creandoProduct = await axios.post(urlCreateProductWoo, datos, config);
                    
            //         // Procesar las actualizaciones de la base de datos en lotes
            //         for (let i = 0; i < creandoProduct.data.create.length; i += 5) {
            //             const batch = creandoProduct.data.create.slice(i, i + 5);
            //             await Promise.all(batch.map(async element => {
            //                 const idproduct = element.id;
            //                 const skuProduct = element.sku;
            //                 const queryUpdate = `Update tbl_productos SET id_woocommerce_producto = ? WHERE Sku_ingram = ?`;
            //                 await this.pool.query(queryUpdate, [idproduct, skuProduct]);
                            
            //                 msg.push(`Se agrego un nuevo Producto: ${element.name}, short ${element.short_description}`);
            //             }));
            //         }
            //     } catch (error) {
            //         console.error(`Error al cargar producto - ${error}`);
            //         msg.push(`Error al cargar producto - ${error}`);
            //     }
            // }
    
            return msg;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async UpdateProductTituloWoo(){
        try {
            const configWoo = new configAPIWoo();

            const config = await configWoo.clavesAjusteGeneral();

            console.log(config);

            const querySelect = `SELECT * FROM tbl_productos`;

            const [row] = await pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id,
                    status: item.status,
                    catalog_visibility: item.catalog_visibility,
                    stock_quantity: item.quantity,
                    reviews_allowed: false
                }
            })

            const productsRows = chunks(data,100);

            let msg = []
            let i = 0
            
            const requests = productsRows.map(async (product) => {
                try {
                    let data = {
                        update: product
                    }
    
                    await axios.post(urlUpdateProductWoo, data, config);
                    i++
                    console.log(`Se actualizo correctamente en Woo: -- ${ i }`);
                    msg.push(`Se actualizo correctamente en Woo: -- ${ i }`);
                } catch (error) {
                    msg.push(`Tienes un error: ${ error }`)
                    throw error
                }
            });

            await Promise.all(requests);

            return msg
        } catch (error) {
            throw error
        }
    }


    async UpdateProductPricesAndSockWoo(){
        try {
            const configWoo = new configAPIWoo();

            const config = await configWoo.clavesAjusteGeneral();

            console.log(config);

            const querySelect = `SELECT * FROM tbl_productos`;

            const [row] = await pool.query(querySelect);

            const data = row.map((item) => {
                return {
                    id: item.id,
                    status: item.status,
                    catalog_visibility: item.catalog_visibility,
                    stock_quantity: item.quantity,
                    reviews_allowed: false
                }
            })

            const productsRows = chunks(data,100);

            let msg = []
            let i = 0
            
            const requests = productsRows.map(async (product) => {
                try {
                    let data = {
                        update: product
                    }
    
                    await axios.post(urlUpdateProductWoo, data, config);
                    i++
                    console.log(`Se actualizo correctamente en Woo: -- ${ i }`);
                    msg.push(`Se actualizo correctamente en Woo: -- ${ i }`);
                } catch (error) {
                    msg.push(`Tienes un error: ${ error }`)
                    throw error
                }
            });

            await Promise.all(requests);

            return msg
        } catch (error) {
            throw error
        }
    }


}

module.exports = PostProductosWoo