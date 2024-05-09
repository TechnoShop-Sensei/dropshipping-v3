const configAPIWoo = require('../../woocommerce/configWooIngram/config.woo');
const configAPIngram = require('../../Ingram/config.ingram');
const { urlProductDetails } = require('../../Helpers/helpsIngram/rutas.ingram');
const { urlAPIFichas } = require('../../Helpers/helpsIngram/rutas.apintegracion');
const { urlUpdateProductWoo } = require('../../Helpers/rutas.woocomerce');
const axios = require('axios');
const pool = require('../../database/conexion');


const chunks = require('chunk-array').chunks
class postFichas2 {

  async getProductTechnicalSpecifications(sku) {
    try {
        const configIngram = new configAPIngram();

        let config = await configIngram.configHeaderGeneralDETAILS()

        const response = await axios.get(`https://api.ingrammicro.com:443/resellers/v6/catalog/details/${sku}`, config);

        const technicalSpecifications = response.data.technicalSpecifications;

        console.log(technicalSpecifications);

        if (technicalSpecifications.length > 0) {
            const groupedData = [];

            technicalSpecifications.forEach(spec => {
                if (!groupedData[spec.hasOwnProperty('headerName')]) {
                    groupedData[spec.headerName] = [];
                }
                groupedData[spec.headerName].push(spec);
            });

            let tableHtml = '<table class="technical-specifications-table">';

            for (const headerName in groupedData) {
                tableHtml += `<tr><th colspan="2">${headerName}</th></tr>`;
                groupedData[headerName].forEach(spec => {
                    tableHtml += `<tr><td>${spec.attributeName}</td><td>${spec.attributeValue}</td></tr>`;
                });
            }

            tableHtml += '</table>';

            return tableHtml;
        }

        return null;
    } catch (error) {
        console.error(error.message);
        return null;
    }
  }

  async  processProducts() {
    try {
        // Assuming you have a way to get all products, replace the next line accordingly
        //const products = getAllProducts();
        const query = 'SELECT * FROM tbl_productos'
        const [products] = await pool.query(query)

        let msg = [];
        let nullCount = 0;
        let insertCount = 0;

        const limit = pLimit(1); // Establece el límite en 1 para ejecutar solo una promesa a la vez

        const promises = products.map(async (product) => {
          const sku = product.sku;
          const id_product = product.id;

          console.log(`Processing product with SKU: ${sku}`);
          console.log("<br>");

          const technicalSpecifications = await this.getProductTechnicalSpecifications(sku);

          if (!technicalSpecifications) {
              console.log(`No technical specifications found for product with SKU: ${sku}`);
              console.log("<br>");
              nullCount++;
              return;
          }

          // Insert into the database
          await this.insertTechnicalSpecificationsIntoDatabase(id_product, sku, technicalSpecifications);

          console.log("Inserted into the database.");
          console.log("<br>");

          msg.push(technicalSpecifications);
          insertCount++;
      });

        await Promise.all(promises);

        console.log(`Finished processing all products. ${insertCount} products inserted, ${nullCount} products with null technical specifications.`);
        return msg;
      
    } catch (error) {
        console.error(error.message);
    }
}
async insertTechnicalSpecificationsIntoDatabase(id,sku, specifications) {
  try {
      // Assuming you have a function to insert data into the database, replace the next line accordingly
    
      const queryInsert = 'INSERT INTO tbl_fichas (id_product, sku, html_Ficha) VALUES (?,?,?)'
      const queryValues = [id, sku, specifications]

      await pool.query(queryInsert, queryValues)

      console.log(`Technical specifications for SKU ${sku} inserted into the database.`);
      console.log("<br>");
  } catch (error) {
      console.error(`Error inserting technical specifications for SKU ${sku}: ${error.message}`);
      console.log("<br>");
  }
}

delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


}

module.exports = postFichas2