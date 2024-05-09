const configAPIWoo = require('../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../Ingram/config.ingram');
const { urlProductosBDI } = require('../../Helpers/helpsIngram/rutas.bdi');
const { urlCreateProductWoo, urlUpdateProductWoo } = require('../../Helpers/rutas.woocomerce');
const { urlPricesIngram } = require('../../Helpers/helpsIngram/rutas.ingram');

const axios = require('axios');
const pool = require('../../database/conexion');
const chunks = require('chunk-array').chunks
const {abreviarYTraducir, procesarTexto, Uppercase, AgregarMarcaTitulo} = require('../../Helpers/setNameProduct')


class PostProductos {
    constructor(pool){
        this.pool = pool;
    }

    async agregarProductosBD(){
        try {
            const response = await axios.get(urlProductosBDI);

            // Obtén todas las marcas y categorías de una sola vez
            const [marcas] = await this.pool.query('SELECT id_bdi FROM ingramMarcas');
            const [categorias] = await this.pool.query('SELECT id_bdi, parent_bdi FROM ingramCategorias');

            // Convertirlos en Sets para un acceso rápido
            // Convertir los ID a strings para coincidir con los datos del response
            const marcasSet = new Set(marcas.map(marca => marca.id_bdi.toString()));
            const categoriasSet = new Set(categorias.map(cat => cat.id_bdi.toString()));

            // Filtrar productos cuyas marcas y categorías existen en la base de datos
            // Asumiendo que id_marca e id_categoria en los productos son strings
           const productosFiltrados = response.data.filter(producto => 
                producto.status === "1" && marcasSet.has(producto.id_marca) && categoriasSet.has(producto.id_categoria));

            let msg = [];


            const batchSize = 10; // Define el tamaño de tu lote aquí

            for (let i = 0; i < productosFiltrados.length; i += batchSize) {
                const batch = productosFiltrados.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch.map(producto => this.insertarProducto(producto)));
                msg.push(...batchResults);
            }
    
            return msg;
            
            
        } catch (error) {
            throw error
        }
    }

    async insertarProducto(producto) {
        try {
            const [ComprobarExiste] = await this.pool.query('SELECT * FROM ingramProductosv2 WHERE Sku_ingram = ?', [producto.sku]);
            if(ComprobarExiste.length > 0){
                return `El producto con SKU: ${producto.sku} ya existe en la base de datos.`;
            }else{
                const dimension_peso = producto.weight ? parseFloat(producto.weight) : 0;
                const dimension_length = producto.length ? parseFloat(producto.length) : 0;
                const dimension_width = producto.width ? parseFloat(producto.width) : 0;
                const dimension_height = producto.height ? parseFloat(producto.height) : 0;

                const [marcas_ID] = await this.pool.query('SELECT Nombre_Optimatizado FROM ingramMarcas Where id_bdi = ?', [producto.id_marca]);
        
                let detalles = "";
                detalles += producto.id_marca ? `<strong>Marca:</strong> ${ marcas_ID[0].Nombre_Optimatizado }<br>` : "";
                detalles += producto.sku ? `<strong>SKU:</strong> ${producto.sku}<br>` : "";
                detalles += producto.codigo_fabricante ? `<strong>Modelo:</strong> ${producto.codigo_fabricante}<br>` : "";
        
                const querySelectMarcas = `SELECT id_woocomerce_marca FROM ingramMarcas WHERE id_bdi = '${producto.id_marca}'`;
                const querySelectCategorias = `SELECT id_woocomerce_categoria, Parent FROM ingramCategorias WHERE id_bdi = '${producto.id_categoria}'`;
        
                const [marca] = await this.pool.query(querySelectMarcas);
                const [categoria] = await this.pool.query(querySelectCategorias);
        
                const sku = producto.sku;
                const TituloFormateado = producto.tituloIngram ? producto.tituloIngram.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : '';
                const SlugFormateado = producto.tituloOptimizado
                const regular_price = 0; // Asume un precio regular de 0 si no se proporciona
                const statusValor = 'publish';
                const visibilty = 'hidden';
                const cantidad = 0; // Asume una cantidad de 0 si no se proporciona
        
                
                // Inserta en la base de datos
                const queryInsert = `INSERT INTO ingramProductosv2 (Sku_ingram, Nombre, Nombre_Optimatizado, Precio_Ingram, Precio_Ingram_Utilidad, Precio_Final, Status_Woocommerce, Catalog_visibility_Woo, Cantidad, Peso, Longitud, Ancho, Altura, id_marca, id_categoria, id_subcategoria, Descripcion_corta, Utilidad_por_Producto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [sku, TituloFormateado, SlugFormateado, regular_price, 0, 0, statusValor, visibilty, cantidad, dimension_peso, dimension_length, dimension_width, dimension_height, marca[0]?.id_woocomerce_marca, categoria[0]?.id_woocomerce_categoria, categoria[0]?.Parent, detalles, 0];
                await this.pool.query(queryInsert, values);
                return `Se ha Agregado SKU: ${sku}, De Nombre: ${TituloFormateado}`;
            }
        } catch (error) {
            return `Error al cargar Producto: ${producto.sku} --- ${error.message}`;
        }
    }


    async agregarProductosWoo () {
        try {
            const configHeader = new configAPIWoo();
            const config = await configHeader.clavesAjusteGeneral();
            const querySelect = `SELECT * FROM ingramProductosv2 as pr INNER JOIN ingramMarcas as mr on pr.id_marca = mr.id_woocomerce_marca`;
            const [rows] = await this.pool.query(querySelect);

            const productosList = rows.map(products => {
                return {
                    //id: products.id,
                    name: products.Nombre,
                    sku: products.Sku_ingram,
                    status: products.Status_Woocommerce,
                    catalog_visibility: products.Catalog_visibility_Woo,
                    short_description: products.Descripcion_corta,
                    regular_price: products.Precio_Ingram,
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
                                products.Nombre_Optimatizado
                            ]
                        }
                    ]    
                }
            });

            let productosRows = chunks(productosList, 100);
            let msg = [];
    
            for (let productsChunk of productosRows) {
                try {
                    const datos = { 
                        create: productsChunk 
                    };
                    const creandoProduct = await axios.post(urlCreateProductWoo, datos, config);
                    
                    // Procesar las actualizaciones de la base de datos en lotes
                    for (let i = 0; i < creandoProduct.data.create.length; i += 5) {
                        const batch = creandoProduct.data.create.slice(i, i + 5);
                        await Promise.all(batch.map(async element => {
                            const idproduct = element.id;
                            const skuProduct = element.sku;
                            const queryUpdate = `Update tbl_productos SET id_woocommerce_producto = ? WHERE Sku_ingram = ?`;
                            await this.pool.query(queryUpdate, [idproduct, skuProduct]);
                            
                            msg.push(`Se agrego un nuevo Producto: ${element.name}, short ${element.short_description}`);
                        }));
                    }
                } catch (error) {
                    console.error(`Error al cargar producto - ${error}`);
                    msg.push(`Error al cargar producto - ${error}`);
                }
            }
    
            return msg;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


}

module.exports = PostProductos