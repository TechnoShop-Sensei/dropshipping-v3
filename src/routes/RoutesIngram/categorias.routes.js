const { Router } = require('express')
const { categoriasPostBD, categoriasPostBDIdentify, categoriasPostIdentifyPrincipales,categoriasPostParentCategoria, categoriasInsertWoo, categoriasUpdateWoo } = require('../../controllers/categorias/categoriasControllerIngram/categoriasIngram.controller')
const router = Router();


router.post('/categorias',  categoriasPostBD);

router.post('/categoriasIdentify',  categoriasPostBDIdentify);

router.post('/categoriasPrincipales',  categoriasPostIdentifyPrincipales);

router.post('/categoriasInsertWoo',  categoriasInsertWoo);

router.post('/categoriasParent',  categoriasPostParentCategoria);

router.post('/categoriasUpdateWoo',  categoriasUpdateWoo);



module.exports = router;