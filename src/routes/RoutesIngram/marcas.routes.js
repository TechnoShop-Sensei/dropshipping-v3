const { Router } = require('express')
const { marcasPost, marcasPostWoo, marcasPostBD } = require('../../controllers/marcas/marcasControllerIngram/marcasIngram.controller');

const router = Router();

router.post('/marcas', marcasPost);
router.post('/marcasBD', marcasPostBD);
router.post('/marcaswoo', marcasPostWoo);

module.exports = router;