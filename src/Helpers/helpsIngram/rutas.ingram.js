// TODO: PRODUCCION
const urlPricesIngram = 'https://api.ingrammicro.com:443/resellers/v6/catalog/priceandavailability'; 
const urlTokenIngram = 'https://api.ingrammicro.com:443/oauth/oauth30/token';
const urlOrderIngram = 'https://api.ingrammicro.com:443/resellers/v6/orders'
const urlProductDetails = 'https://api.ingrammicro.com:443/resellers/v6/catalog/details/'

// ?: SANDBOX

const urlPricesIngramSandbox = 'https://api.ingrammicro.com:443/sandbox/resellers/v6/catalog/priceandavailability';
const urlOrderIngramSandbox = 'https://api.ingrammicro.com:443/sandbox/resellers/v6/orders';


module.exports = {urlPricesIngram, urlTokenIngram, urlOrderIngramSandbox, urlOrderIngram, urlProductDetails}