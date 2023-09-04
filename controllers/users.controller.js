const { response } = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/users.model');

/** ======================================================================
 *  GET USERss
=========================================================================*/
const getUsers = async(req, res) => {

    try {

        const [users, total] = await Promise.all([
            User.find({}, 'email name cedula role address img status uid'),
            User.countDocuments()
        ]);

        res.json({
            ok: true,
            users,
            total
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });

    }


};

/** =====================================================================
 *  GET USERS ID
=========================================================================*/
const getUserId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const userDB = await User.findById(id);
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No hemos encontrado este usuario, porfavor intente nuevamente.'
            });
        }

        res.json({
            ok: true,
            user: userDB
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/** =====================================================================
 *  CREATE USERS
=========================================================================*/
const createUsers = async(req, res = response) => {

    
    try {

        let { email, password } = req.body;
        email = email.trim().toLowerCase();
        
        const validarUsuario = await User.findOne({ email });

        if (validarUsuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existen alguien con este email'
            });
        }

        const user = new User(req.body);

        // ENCRYPTAR PASSWORD
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(password, salt);
        user.email = user.email.trim().toLowerCase();

        // SAVE USER
        await user.save();

        res.json({
            ok: true,
            user
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }
};
/** =====================================================================
 *  CREATE USERS
=========================================================================*/

/** =====================================================================
 *  UPDATE USER
=========================================================================*/
const updateUser = async(req, res = response) => {

    const uid = req.params.id;

    try {

        // SEARCH USER
        const userDB = await User.findById(uid);
        if (!userDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH USER

        // VALIDATE USER
        let { password, email, ...campos } = req.body;
        email = email.trim().toLowerCase()

        if (userDB.email !== email) {
            const validarEmail = await User.findOne({ email });
            if (validarEmail) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con este email'
                });
            }
        }

        if (password) {

            // ENCRYPTAR PASSWORD
            const salt = bcrypt.genSaltSync();
            campos.password = bcrypt.hashSync(password, salt);

        }

        // UPDATE
        campos.email = email;
        const userUpdate = await User.findByIdAndUpdate(uid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            user: userUpdate
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error Inesperado'
        });
    }

};
/** =====================================================================
 *  UPDATE USER
=========================================================================*/
/** =====================================================================
 *  DELETE USER
=========================================================================*/
const deleteUser = async(req, res = response) => {

    const uid = req.params.id;

    try {

        // SEARCH DEPARTMENT
        const userDB = await User.findById({ _id: uid });
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }
        // SEARCH DEPARTMENT

        if (userDB.role !== 'ADMIN') {
            return res.status(400).json({
                ok: false,
                msg: 'No tienes los privilegios para editar este usuario'
            });
        }

        // CHANGE STATUS
        if (userDB.status === true) {
            userDB.status = false;
        } else {
            userDB.status = true;
        }
        // CHANGE STATUS

        const userUpdate = await User.findByIdAndUpdate(uid, userDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            user: userUpdate
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};
/** =====================================================================
 *  DELETE USER
=========================================================================*/


// EXPORTS
module.exports = {
    getUsers,
    createUsers,
    updateUser,
    deleteUser,
    getUserId
};