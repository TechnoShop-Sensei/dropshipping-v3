const { Router } = require('express')
const { marcasPost, marcasPostWoo } = require('../controllers/marcas/marcas.controller');

const router = Router();

router.post('/marcas', marcasPost);

router.post('/marcaswoo', marcasPostWoo);

module.exports = router;