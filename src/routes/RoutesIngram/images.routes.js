const { Router } = require('express');
const { ImagenAgregarWoo, ImagenCrearBD } = require('../../controllers/imagen/ImagenControllerIngram/imagen.controller');


const router = Router();

router.get('/imagenesaddbd', ImagenCrearBD);
router.get('/imagenaddwoo', ImagenAgregarWoo );



module.exports = router;