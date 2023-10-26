/** =====================================================================
 *  MESAS ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLERS
const { getMesas, createMesa, getMesasId, updateMesa, deleteMesa, addVotoMesa, delVoto, openAllMesas } = require('../controllers/mesas.controller');


const router = Router();

/** =====================================================================
 *  POST MESA
=========================================================================*/
router.post('/query', validarJWT, getMesas);

/** =====================================================================
 *  GET MESA ID
=========================================================================*/
router.get('/:id', validarJWT, getMesasId);

/** =====================================================================
 *  POST MESA TASK
=========================================================================*/
router.post('/', [
        validarJWT,
        check('staff', 'El ID del Staff es invalido').isMongoId(),
        check('center', 'El ID del centro de votación es invalido').isMongoId(),
        validarCampos
    ],
    createMesa
);

/** =====================================================================
 *  POST ADD VOTO
=========================================================================*/
router.post('/add/voto', [
    validarJWT,
    check('candidate', 'El ID del candidato es invalido').isMongoId(),
    check('qty', 'El ID del centro de votación es invalido').not().isEmpty(),
    check('mesa', 'El ID de la mesa de votación es invalido').isMongoId(),
    validarCampos
],
addVotoMesa
);

/** =====================================================================
 *  PUT MESA
=========================================================================*/
router.put('/:id', validarJWT, updateMesa);

/** =====================================================================
 *  PUT OPEN OR CLOSE MESA
=========================================================================*/
router.put('/open/all', validarJWT, openAllMesas);

/** =====================================================================
 *  DELETE MESA
=========================================================================*/
router.delete('/:id', validarJWT, deleteMesa);

/** =====================================================================
 *  DELETE VOTO OF MESA
=========================================================================*/
router.delete('/voto/:mid/:voto/:qty', validarJWT, delVoto);



// EXPORT
module.exports = router;