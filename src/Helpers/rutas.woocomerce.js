
// TODO: Productos
const urlCreateProductWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/batch';
const urlViewProductsWoo =  'https://techno-shop.mx/wp-json/wc/v3/products'; 
const urlUpdateProductWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/batch';

// TODO: Categories
const urlViewCategoriasWoo =    'https://techno-shop.mx/wp-json/wc/v3/products/categories';
const urlCreateCategoriasWoo =  'https://techno-shop.mx/wp-json/wc/v3/products/categories/batch';
const urlUpdateCategoriasWoo =  'https://techno-shop.mx/wp-json/wc/v3/products/categories/batch'

// TODO: Marcas
const urlViewMarcasWoo =   'https://techno-shop.mx/wp-json/wc/v3/products/attributes/3/terms';
const urlCreateMarcasWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/attributes/3/terms/batch';
const urlUpdateMarcasWoo = 'https://techno-shop.mx/wp-json/wc/v3/products/attributes/3/terms/batch';

module.exports = {
    urlCreateProductWoo,
    urlViewProductsWoo,
    urlUpdateProductWoo,
    urlViewCategoriasWoo,
    urlCreateCategoriasWoo,
    urlUpdateCategoriasWoo,
    urlViewMarcasWoo,
    urlCreateMarcasWoo,
    urlUpdateMarcasWoo
}