const configAPIWoo = require('../../../woocommerce/configWooIngram/config.woo');
const configAPIIngram = require('../../../Ingram/config.ingram');
const {  urlUpdateProductWoo  } = require('../../../Helpers/rutas.woocomerce');

const axios = require('axios');
const chunks = require('chunk-array').chunks

// Solo Realiza Acciones de Woo
class PutAtributosWoo {
    constructor(pool){
        this.pool = pool;
    }


    async ActualizarAtributosProductWoo() {
        try {
            const configWoo = new configAPIWoo();
            const config = await configWoo.clavesAjusteGeneral();
    
            console.log(config);
    
            const querySelect = `SELECT pr.id_woocommerce_producto, pr.Sku_ingram, pr.id_marca , mr.Nombre_Marca_Principal, wf.Color, wp.Pulgada  
                                 FROM ingramProductosv2 as pr 
                                 INNER JOIN wooMarcasNew as mr ON pr.id_marca = mr.id_woocommerce 
                                 LEFT JOIN WooFiltrosColoresProductos as wf on pr.id_woocommerce_producto = wf.id_Producto_woo 
                                 LEFT JOIN WooFiltrosPulgadasProductos as wp on pr.id_woocommerce_producto = wp.id_Producto_woo`;
    
            const [row] = await this.pool.query(querySelect);
    
            const data = row.map((item) => {
                const attributes = [];
                
                if (item.Nombre_Marca_Principal) {
                    attributes.push({
                        id: 3,
                        name: "Marcas",
                        position: 0,
                        options: [item.Nombre_Marca_Principal]
                    });
                }
    
                if (item.Color) {
                    attributes.push({
                        id: 10,
                        name: "Color",
                        position: 0,
                        options: [item.Color]
                    });
                }

                if (item.Pulgada) {
                    attributes.push({
                        id: 7,
                        name: "Pulgada",
                        position: 0,
                        options: [item.Pulgada]
                    });
                }
    
                return {
                    id: item.id_woocommerce_producto,
                    attributes: attributes,
                };
            });
    
            const productsRows = chunks(data, 100);
    
            let msg = [];
            let i = 0;
    
            const requests = productsRows.map(async (product) => {
                try {
                    let data = {
                        update: product
                    };
    
                    await axios.post(urlUpdateProductWoo, data, config);
                    i++;
                    console.log(`Se actualizo correctamente los Atributos en woo: -- ${i}`);
                    msg.push(`Se actualizo correctamente los Atributos en woo: -- ${i}`);
                } catch (error) {
                    msg.push(`Tienes un error: ${error}`);
                    throw error;
                }
            });
    
            await Promise.all(requests);
    
            return msg;
        } catch (error) {
            throw error;
        }
    }
    

}

module.exports = PutAtributosWoo