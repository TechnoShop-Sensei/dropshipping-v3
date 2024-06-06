
// TODO: Productos
const urlCreateProductWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/batch';
const urlUpdateProductWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/batch';
const urlGetProductWoo = 'https://techno-shop.mx/wp-json/wc/v3/products';

// TODO: Categories
const urlViewCategoriasWoo =    'https://techno-shop.mx/wp-json/wc/v3/products/categories';
const urlCreateCategoriasWoo =  'https://techno-shop.mx/wp-json/wc/v3/products/categories/batch';
const urlUpdateCategoriasWoo =  'https://techno-shop.mx/wp-json/wc/v3/products/categories/batch'

// TODO: Marcas
const urlViewMarcasWoo =   'https://techno-shop.mx/wp-json/wc/v3/products/attributes/3/terms';
const urlCreateMarcasWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/attributes/3/terms/batch';
const urlUpdateMarcasWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/attributes/3/terms/batch';

// TODO: Filtros Atributos
const urlGetColores = "https://techno-shop.mx/wp-json/wc/v3/products/attributes/10/terms"
const urlGetPulgadas = "https://techno-shop.mx/wp-json/wc/v3/products/attributes/7/terms"
const urlGetHerzt = "https://techno-shop.mx/wp-json/wc/v3/products/attributes/11/terms"
const urlCreateColores =   'https://techno-shop.mx/wp-json/wc/v3/products/attributes/10/terms/batch';
const urlCreatePulgadas =   'https://techno-shop.mx/wp-json/wc/v3/products/attributes/7/terms/batch';
const urlCreateHerzt =   'https://techno-shop.mx/wp-json/wc/v3/products/attributes/11/terms/batch';


module.exports = {
    urlCreateProductWoo,
    urlUpdateProductWoo,
    urlViewCategoriasWoo,
    urlCreateCategoriasWoo,
    urlUpdateCategoriasWoo,
    urlViewMarcasWoo,
    urlCreateMarcasWoo,
    urlUpdateMarcasWoo,
    urlGetProductWoo,

    urlCreateColores,
    urlCreatePulgadas,

    urlGetColores,
    urlGetPulgadas,

    urlGetHerzt,
    urlCreateHerzt
}