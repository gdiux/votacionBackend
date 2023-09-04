/** =====================================================================
 *  CENTERS ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLERS
const { getCandidates, getCandidateId, createCandidate, updateCandidate, deleteCandidate } = require('../controllers/candidates.controller');

const router = Router();

/** =====================================================================
 *  POST CANDIDATE
=========================================================================*/
router.post('/query', validarJWT, getCandidates);

/** =====================================================================
 *  GET CANDIDATE ID
=========================================================================*/
router.get('/:id', validarJWT, getCandidateId);

/** =====================================================================
 *  POST CANDIDATE
=========================================================================*/
router.post('/', [
        validarJWT,
        check('name',   'El nombre es olbigatorio').not().isEmpty(),
        check('cedula', 'La cedula de ciudadania es olbigatoria').not().isEmpty(),
        validarCampos
    ],
    createCandidate
);

/** =====================================================================
 *  PUT CANDIDATE
=========================================================================*/
router.put('/:id', validarJWT, updateCandidate);

/** =====================================================================
 *  DELETE CANDIDATE
=========================================================================*/
router.delete('/:id', validarJWT, deleteCandidate);



// EXPORT
module.exports = router;