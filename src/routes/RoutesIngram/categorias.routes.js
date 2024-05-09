const { Router } = require('express')
const { categoriasPost, categoriasPostWoo, categoriasPutBD, categoriasPutWoo, categoriasGeneralesBD } = require('../../controllers/categorias/categorias.controller')
const router = Router();


router.post('/categorias',  categoriasPost);

router.post('/categoriasWoo',  categoriasPostWoo);

router.post('/categoriasparent',  categoriasPutBD);

router.post('/categoriasparentwoo',  categoriasPutWoo);

router.post('/categoriasgenerales',  categoriasGeneralesBD);



module.exports = router;