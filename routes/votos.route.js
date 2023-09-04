/** =====================================================================
 *  VOTOS ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLERS
const { getVotos, getVotoId, createVoto, deleteVoto } = require('../controllers/votos.controller');

const router = Router();

/** =====================================================================
 *  POST VOTO
=========================================================================*/
router.post('/query', validarJWT, getVotos);

/** =====================================================================
 *  GET VOTO ID
=========================================================================*/
router.get('/:id', validarJWT, getVotoId);

/** =====================================================================
 *  POST VOTO
=========================================================================*/
router.post('/', [
        validarJWT,
        check('mesa', 'El ID de la mesa es invalido').isMongoId(),
        check('candidate', 'El ID del candidato es invalido').isMongoId(),
        validarCampos
    ],
    createVoto
);

/** =====================================================================
 *  DELETE VOTO
=========================================================================*/
router.delete('/:id', validarJWT, deleteVoto);



// EXPORT
module.exports = router;