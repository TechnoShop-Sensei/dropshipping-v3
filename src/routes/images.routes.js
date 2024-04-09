const { Router } = require('express');
const { ImagenPost,ImagenPostWoo } = require('../controllers/imagen/imagen.controller');


const router = Router();

router.get('/imagen', ImagenPost);
router.get('/imagenwoo', ImagenPostWoo );



module.exports = router;