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

    // ? Agrgando Productos Nuevos a Woocommerce
    async agregarProductosWoo() {
        try {
            const configHeader = new configAPIWoo();
            const config = await configHeader.clavesAjusteGeneral();
            const querySelect = `SELECT * FROM ingramProductosv2 as pr 
                                 INNER JOIN wooMarcasNew as mr 
                                 ON pr.id_marca = mr.id_woocommerce
                                 WHERE pr.id_woocommerce_producto IS NULL`;
            const [rows] = await this.pool.query(querySelect);
    
            const productosList = rows.map(products => {
                return {
                    name: products.Nombre_Optimatizado !== null ? products.Nombre_Optimatizado : products.Nombre,
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
                };
            });
    
            let productosRows = chunks(productosList, 100);
            let msg = [];
    
            await Promise.all(productosRows.map(async (productsChunk) => {
                try {
                    const datos = { create: productsChunk };
                    const creandoProduct = await axios.post(urlCreateProductWoo, datos, config);
                    
                    await Promise.all(creandoProduct.data.create.map(async (element) => {
                        const idproduct = element.id;
                        const skuProduct = element.sku;
                        const queryUpdate = `UPDATE ingramProductosv2 SET id_woocommerce_producto = ? WHERE Sku_ingram = ?`;
                        await this.pool.query(queryUpdate, [idproduct, skuProduct]);
                        
                        msg.push(`Se agregó un nuevo producto: ${element.name}, SKU: ${element.sku}`);
                    }));
                } catch (error) {
                    console.error(`Error al cargar producto - ${error}`);
                    msg.push(`Error al cargar producto - ${error}`);
                }
            }));
    
            return msg;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    


}

module.exports = PostProductosWoo