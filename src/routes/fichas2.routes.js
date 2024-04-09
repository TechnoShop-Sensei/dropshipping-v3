const { Router } = require('express');
const { fichasPost, fichasPostData } = require('../controllers/fichas2/fichas2.controller');

const router = Router();

router.post('/fichas', fichasPost);

router.post('/fichaspost', fichasPostData);



module.exports = router;