const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const { urlProductosBDI } = require('../../../Helpers/helpsIngram/rutas.bdi');
const { urlCreateProductWoo, urlUpdateProductWoo } = require('../../../Helpers/rutas.woocomerce');
const { urlPricesIngram } = require('../../../Helpers/helpsIngram/rutas.ingram');

const axios = require('axios');
const pool = require('../../../database/conexion');
const chunks = require('chunk-array').chunks
const {abreviarYTraducir, procesarTexto, Uppercase, AgregarMarcaTitulo} = require('../../../Helpers/setNameProduct')


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
                let statusValor = 'publish'
                let visibility = 'hidden'
                let cantidad = 0;
                let precioFinal = 0;
                let precioIngram = 0;
                let precioConUtilidad = 0;

                const dimension_peso = producto.weight ? parseFloat(producto.weight) : 0; // Peso
                const dimension_length = producto.length ? parseFloat(producto.length) : 0; // Longitud
                const dimension_width = producto.width ? parseFloat(producto.width) : 0; // Ancho
                const dimension_height = producto.height ? parseFloat(producto.height) : 0; // Altura

                const [categorias_ID] = await this.pool.query(`SELECT * FROM wooCategoriasNew2 Where id_ingram_Categorias = "BDI_${producto.id_categoria}"`);
                const [marcas_ID] = await this.pool.query(`SELECT * FROM wooMarcasNew WHERE id_ingram_Marcas = "BDI_${producto.id_marca}"`)
                
 
                const marcaID = marcas_ID[0].id_woocommerce;
                const categoriaPadre = categorias_ID[0].id_woocommerce
                const subcategoria = categorias_ID[0].id_parent_woocommerce
                 // Selecciona 'tituloOptimizado' si existe y no está vacío, de lo contrario selecciona 'tituloIngram'
                const titulo = producto.tituloOptimizado || producto.tituloIngram;
                
                // Limpia y capitaliza el título
                const tituloLimpioCapitalizado = this.capitalizarTitulo(titulo);
                

                const sku = producto?.sku
             
                try {
                    const queryInsert = `INSERT INTO ingramProductosv2 (Sku_ingram, Nombre, Precio_Ingram, Precio_Ingram_Utilidad, Precio_Final, Status_Woocommerce, Catalog_visibility_Woo, Cantidad, Peso, Longitud, Ancho, Altura, id_marca, id_categoria, id_subcategoria,Utilidad_por_Producto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                    const values = [sku, tituloLimpioCapitalizado, precioIngram, precioConUtilidad, precioFinal, statusValor, visibility, cantidad, dimension_peso, dimension_length , dimension_width, dimension_height, marcaID, categoriaPadre, subcategoria, 0];
                    await pool.query(queryInsert, values);
                    
                    
                    return `Se ha Agregado SKU: ${ producto.sku }, De Nombre: ${ tituloLimpioCapitalizado }`;
                } catch (error) {
                    return `Error al cargar Producto: ${ producto.sku } --- ${ error.message }`;
                }

            }
        } catch (error) {
            return `Error al cargar Producto: ${producto.sku} --- ${error.message}`;
        }
    }


     // Función para capitalizar cada palabra en una cadena, excepto palabras específicas
     capitalizarTitulo(titulo) {
        const excepciones = ['USB', 'HDMI', 'PS2', 'DVD', 'SSD'];  // Añade más excepciones tecnológicas según sea necesario
        const palabrasEnMinusculas = ['y', 'las', 'de', 'a'];  // Palabras que deben estar en minúsculas

        // Capitalizar cada palabra, manejar excepciones específicas y palabras comunes
        return titulo
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map((palabra, index, palabras) => {
                if (excepciones.includes(palabra.toUpperCase())) {
                    return palabra.toUpperCase();  // Mantener la palabra en mayúsculas si está en la lista de excepciones tecnológicas
                } else if (palabrasEnMinusculas.includes(palabra.toLowerCase()) && index !== 0 && !palabras[index - 1].endsWith('.')) {
                    return palabra.toLowerCase();  // Palabras comunes en minúsculas excepto al inicio o después de un punto
                } else {
                    return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();  // Capitalizar la primera letra y el resto en minúsculas
                }
            })
            .join(' ');
    }


}

module.exports = PostProductos