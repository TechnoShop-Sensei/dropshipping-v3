const { Router } = require('express')
const { categoriasPost, categoriasPostWoo, categoriasPutBD, categoriasPutWoo } = require('../controllers/categorias/categorias.controller')
const router = Router();


router.post('/categorias',  categoriasPost);

router.post('/categoriasWoo',  categoriasPostWoo);

router.post('/categoriasparent',  categoriasPutBD);

router.post('/categoriasparentwoo',  categoriasPutWoo);



module.exports = router;