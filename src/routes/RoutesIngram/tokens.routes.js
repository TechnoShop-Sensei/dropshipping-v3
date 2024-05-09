const { Router } = require('express')
const { tokenUpdateIngram, tokenUpdateBDI } = require('../../controllers/token.controllers');

const router = Router();


router.get('/', tokenUpdateIngram); // Ruta Token Ingram Update en BD
router.get('/bdi', tokenUpdateBDI)


module.exports = router;