/** =====================================================================
 *  USER ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');

// CONTROLLERS
const { getUsers, createUsers, updateUser, deleteUser, getUserId } = require('../controllers/users.controller');

const router = Router();

/** =====================================================================
 *  GET USERS
=========================================================================*/
router.get('/', validarJWT, getUsers);

/** =====================================================================
 *  GET USERS ID
=========================================================================*/
router.get('/user/:id', validarJWT, getUserId);

/** =====================================================================
 *  POST CREATE USER
=========================================================================*/
router.post('/', [
        check('email', 'El email es obligatorio').not().isEmpty(),
        check('cedula', 'La Cedula de ciudadania es obligatoria').not().isEmpty(),
        check('name', 'El nombre es olbigatorio').not().isEmpty(),
        check('password', 'La contraseña es obligatoria').not().isEmpty(),
        validarCampos
    ],
    createUsers
);
/** =====================================================================
 *  POST CREATE USER
=========================================================================*/
/** =====================================================================
 *  PUT USERS
=========================================================================*/
router.put('/:id', [
        validarJWT,
        check('email', 'El email es obligatorio').not().isEmpty(),
        check('name', 'El nombre es olbigatorio').not().isEmpty(),
        validarCampos
    ],
    updateUser
);
/** =====================================================================
 *  PUT USER
=========================================================================*/
/** =====================================================================
 *  DELETE USER
=========================================================================*/
router.delete('/:id', validarJWT, deleteUser);
/** =====================================================================
 *  DELETE USER
=========================================================================*/



// EXPORT
module.exports = router;