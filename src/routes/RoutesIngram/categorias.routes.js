const { Router } = require('express')
const { categoriasPostBD, categoriasPostBDIdentify, categoriasPostIdentifyPrincipales,categoriasPostParentCategoria, categoriasInsertWoo, categoriasUpdateWoo } = require('../../controllers/categorias/categoriasControllerIngram/categoriasIngram.controller')
const router = Router();


router.post('/categorias',  categoriasPostBD); // Almacenar categorias de Ingram

router.post('/categoriasIdentify',  categoriasPostBDIdentify); // Crear CategoriasNew2 Ingram

router.post('/categoriasPrincipales',  categoriasPostIdentifyPrincipales); // Crear CategoriasNew2 Principales

router.post('/categoriasInsertWoo',  categoriasInsertWoo); // Insertar Categorias en Woo

/*router.post('/categoriasParent',  categoriasPostParentCategoria);*/

router.post('/categoriasUpdateWoo',  categoriasUpdateWoo);



module.exports = router;