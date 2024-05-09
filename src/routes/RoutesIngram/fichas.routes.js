const { Router } = require('express');
const { fichasPost, fichasPostWoo, fichasPostData,fichasPutData, fichasCreateData } = require('../controllers/fichas/fichas.controller');

const router = Router();

router.post('/fichas', fichasPost);

router.post('/fichasbd', fichasPostData);

router.post('/fichasput', fichasPutData);

router.post('/fichashtml', fichasCreateData)

router.post('/fichaswoo',  fichasPostWoo);



module.exports = router;