const puppeteer = require('puppeteer');
const fs = require('fs');
const pool = require('../../../database/conexion');

class AbasteoScraper {
  constructor(pool) {
    this.pool = pool;
  }

  async init() {
    this.browser = await puppeteer.launch({
      // Opciones de lanzamiento...
    });
    this.page = await this.browser.newPage();
  }

  async fetchPartNumbers() {
    const [rows] = await this.pool.execute('SELECT Modelo, Sku_ingram, id_producto FROM ingramProductosv2');
    return rows;
  }

  async saveResultToDatabase(id, title) {
    try {
      const [result] = await this.pool.execute(
        'UPDATE ingramProductosv2 SET Nombre_Optimatizado = ? WHERE id_producto = ?',
        [title, id]
      );
      console.log(`Resultado actualizado para ID: ${id}`);
    } catch (error) {
      console.error(`Error al actualizar el resultado en la base de datos: ${error}`);
    }
  }

  async saveMissingToFile(id, sku, VPN) {
    const missing = `${id}, ${sku}, ${VPN}\n`;
    fs.appendFileSync('zero.txt', missing);
  }

  async scrapePartNumber(partNumber) {
    const { Modelo, Sku_ingram, id_producto } = partNumber;
    try {
      await this.page.goto('https://www.abasteo.mx');
      await this.page.waitForTimeout(3000);
      await this.page.type('input[name="searchparam"]', Modelo);
      await this.page.waitForTimeout(3000);
      await this.page.waitForSelector('button.cpx-button-new.cpx-button-new--primary.c-header-search__button', { visible: true });

      // Inicia la navegación
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
        this.page.click('button.cpx-button-new.cpx-button-new--primary.c-header-search__button'),
      ]);

      const title = await this.page.evaluate(() => {
        const titleElement = document.querySelector('h1.cpx-h1.cpx-h1--dark');
        return titleElement ? titleElement.innerText : 'Título no encontrado';
      });

      if (title.includes('resultados') || title === 'Título no encontrado') {
        await this.saveMissingToFile(id_producto, Sku_ingram, Modelo);
      } else {
        console.log(`${id_producto}, ${Sku_ingram}, ${Modelo} TITULO: ${title}`);
        await this.saveResultToDatabase(id_producto, title);
        await this.page.waitForTimeout(2500);
      }

    } catch (error) {
      console.error(`Error con el número de parte ${Modelo}: ${error}`);
      await this.saveMissingToFile(id_producto, Sku_ingram, Modelo);
    }
  }

  async scrapeAll() {
    const partNumbers = await this.fetchPartNumbers();
    for (const partNumber of partNumbers) {
      await this.scrapePartNumber(partNumber);
    }
    await this.browser.close();
    await this.pool.end();
  }
}

// Uso de la clase
(async () => {
  const scraper = new AbasteoScraper(pool);

  await scraper.init();
  await scraper.scrapeAll();
})();

// Implementación de waitForTimeout
puppeteer.Page.prototype.waitForTimeout = function (timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
};
