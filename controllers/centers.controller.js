const { response } = require('express');

const Center = require('../models/centers.model');

/** =====================================================================
 *  GET CENTERS
=========================================================================*/
const getCenters = async(req, res) => {

    try {

        const { desde, hasta, ...query } = req.body;

        const [centers, total] = await Promise.all([
            Center.find(query)
            .limit(hasta)
            .skip(desde),
            Center.countDocuments()
        ]);

        res.json({
            ok: true,
            centers,
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
 *  GET CENTER ID
=========================================================================*/
const getCenterId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const centerDB = await Center.findById(id);
        if (!centerDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun centro de votación con este ID'
            });
        }

        res.json({
            ok: true,
            center: centerDB
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
 *  CREATE CENTER
=========================================================================*/
const createCenter = async(req, res = response) => {

    
    try {
        
        const center = new Center(req.body);       

        // SAVE CENTER
        await center.save();

        res.json({
            ok: true,
            center
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
 *  UPDATE CENTER
=========================================================================*/
const updateCenter = async(req, res = response) => {
    
    try {

        const ceid = req.params.id;

        // SEARCH CENTER
        const centerDB = await Center.findById(ceid);
        if (!centerDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun centro de votación con este ID'
            });
        }
        // SEARCH CENTER

        // VALIDATE CENTER
        const { ...campos } = req.body;

        // UPDATE
        const centerUpdate = await Center.findByIdAndUpdate(ceid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            center: centerUpdate
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
 *  DELETE CENTER
=========================================================================*/
const deleteCenter = async(req, res = response) => {
    
    try {
        const ceid = req.params.id;
        const uid = req.uid;

        // SEARCH USER
        const userDB = await User.findById({ _id: uid });
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun usuario con este ID'
            });
        }else{
            if (userDB.role !== 'ADMIN') {
                return res.status(400).json({
                    ok: false,
                    msg: 'No tienes los privilegios para editar este centro de votación'
                });
            }
        }
        // SEARCH USER
        
        // SEARCH CENTER
        const centerDB = await Center.findById({ _id: ceid });
        if (!centerDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun centro de votación con este ID'
            });
        }
        // SEARCH CENTER

        // CHANGE STATUS
        if (centerDB.status === true) {
            centerDB.status = false;
        } else {
            centerDB.status = true;
        }
        // CHANGE STATUS

        const centerUpdate = await Center.findByIdAndUpdate(ceid, centerDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            center: centerUpdate
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};


// EXPORTS
module.exports = {
    getCenters,
    createCenter,
    updateCenter,
    deleteCenter,
    getCenterId
};