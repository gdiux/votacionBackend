/** =====================================================================
 *  CENTERS ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLERS
const { getCenters, getCenterId, createCenter, updateCenter, deleteCenter } = require('../controllers/centers.controller');

const router = Router();

/** =====================================================================
 *  POST CENTER
=========================================================================*/
router.post('/query', validarJWT, getCenters);

/** =====================================================================
 *  GET CENTER ID
=========================================================================*/
router.get('/:id', validarJWT, getCenterId);

/** =====================================================================
 *  POST CENTER TASK
=========================================================================*/
router.post('/', [
        validarJWT,
        check('name',       'El nombre es olbigatorio').not().isEmpty(),
        check('department', 'El departamento es olbigatorio').not().isEmpty(),
        check('city',       'La ciudad es olbigatoria').not().isEmpty(),
        check('address',    'La dirección es olbigatoria').not().isEmpty(),
        validarCampos
    ],
    createCenter
);

/** =====================================================================
 *  PUT CENTER
=========================================================================*/
router.put('/:id', validarJWT, updateCenter);

/** =====================================================================
 *  DELETE CENTER
=========================================================================*/
router.delete('/:id', validarJWT, deleteCenter);



// EXPORT
module.exports = router;