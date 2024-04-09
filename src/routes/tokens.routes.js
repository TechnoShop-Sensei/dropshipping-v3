const { Router } = require('express')
const { tokenUpdateIngram } = require('../controllers/token.controllers');

const router = Router();


router.get('/v10', tokenUpdateIngram); // Ruta Token Ingram Update en BD



module.exports = router;