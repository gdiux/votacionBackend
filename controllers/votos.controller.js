const { response } = require('express');

const Voto = require('../models/votos.model');
const Mesa = require('../models/mesas.model');
const User = require('../models/users.model');

/** =====================================================================
 *  GET VOTO
=========================================================================*/
const getVotos = async(req, res) => {

    try {

        const { desde, hasta, ...query } = req.body;

        const [votos, total] = await Promise.all([
            Voto.find(query)
            .populate('candidate')
            .populate('mesa')
            .limit(hasta)
            .skip(desde),
            Voto.countDocuments(query)
        ]);

        res.json({
            ok: true,
            votos,
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
 *  GET VOTO ID
=========================================================================*/
const getVotoId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const votoDB = await Voto.findById(id)
            .populate('candidate')
            .populate('mesa');

        if (!votoDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun voto con este ID'
            });
        }

        res.json({
            ok: true,
            voto: votoDB
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
 *  CREATE VOTO
=========================================================================*/
const createVoto = async(req, res = response) => {

    
    try {        
        const voto = new Voto(req.body);
        
        // COMPROBAR CENTRO DE VOTACION
        const mesaDB = await Mesa.findById(voto.mesa);
        if (!mesaDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }

        const validateVoto = await Voto.findOne({candidate: voto.candidate, mesa: voto.mesa });
        if (validateVoto) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya este candidato tiene un voto de esta mesa.'
            });
        }

        // SAVE MESA
        await voto.save();

        // DEVOLVER MESA
        const votoDB = await Voto.findById(voto.vid)
            .populate('candidate')
            .populate('mesa');

        res.json({
            ok: true,
            voto: votoDB
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
 *  DELETE VOTO
=========================================================================*/
const deleteVoto = async(req, res = response) => {
    
    try {
        const vid = req.params.id;
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
                    msg: 'No tienes los privilegios para editar esta mesa de votación'
                });
            }
        }
        // SEARCH USER
        
        // SEARCH CENTER
        const votoDB = await Voto.findById({ _id: vid });
        if (!votoDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }
        // SEARCH CENTER

        // CHANGE STATUS
        await Voto.findByIdAndDelete(vid);

        res.json({
            ok: true,
            msg: 'Se elimino con exito el voto'
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
    getVotos,
    createVoto,
    deleteVoto,
    getVotoId
};