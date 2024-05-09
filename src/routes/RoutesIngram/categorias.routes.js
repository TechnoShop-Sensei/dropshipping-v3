const { Router } = require('express')
const { categoriasPostBD, categoriasPostBDIdentify, categoriasPostIdentifyPrincipales,categoriasPostParentCategoria, categoriasUpdateInserWoo } = require('../../controllers/categorias/categoriasControllerIngram/categoriasIngram.controller')
const router = Router();


router.post('/categorias',  categoriasPostBD);

router.post('/categoriasIdentify',  categoriasPostBDIdentify);

router.post('/categoriasPrincipales',  categoriasPostIdentifyPrincipales);

router.post('/categoriasParent',  categoriasPostParentCategoria);

router.post('/categoriasUpdateInsert',  categoriasUpdateInserWoo);



module.exports = router;