const { response } = require('express');

const ObjectId = require('mongoose').Types.ObjectId;

const Mesa = require('../models/mesas.model');
const Center = require('../models/centers.model');
const User = require('../models/users.model');

/** =====================================================================
 *  GET MESAS
=========================================================================*/
const getMesas = async(req, res) => {

    try {

        const { desde, hasta, ...query } = req.body;

        const [mesas, total] = await Promise.all([
            Mesa.find(query)
            .populate('center')
            .populate('votacion.candidate')
            .populate('votacion.testigo', 'email name cedula role address img status fecha uid')
            .populate('staff', 'email name cedula role address img status fecha uid')
            .limit(hasta)
            .skip(desde),
            Mesa.countDocuments(query)
        ]);

        res.json({
            ok: true,
            mesas,
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
 *  GET MESA ID
=========================================================================*/
const getMesasId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const mesaDB = await Mesa.findById(id)
            .populate('center')
            .populate('votacion.candidate')
            .populate('votacion.testigo', 'email name cedula role address img status fecha uid')
            .populate('staff', 'email name cedula role address img status fecha uid');
        if (!mesaDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }

        res.json({
            ok: true,
            mesa: mesaDB
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
 *  CREATE MESA
=========================================================================*/
const createMesa = async(req, res = response) => {

    
    try {        
        const mesa = new Mesa(req.body);
        
        // COMPROBAR CENTRO DE VOTACION
        const centerDB = await Center.findById(mesa.center);
        if (!centerDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun centro de votación con este ID'
            });
        }

        // NUMERO DE MESA
        const number = await Mesa.countDocuments({center: mesa.center});

        mesa.number = number + 1;

        // SAVE MESA
        await mesa.save();

        // DEVOLVER MESA
        const mesaDB = await Mesa.findById(mesa.mid)
            .populate('center')
            .populate('staff');

        res.json({
            ok: true,
            mesa: mesaDB
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
 *  ADD VOTO
=========================================================================*/
const addVotoMesa = async(req, res = response) => {

    try {
        
        const uid = req.uid;
        const { mesa, ...voto } = req.body;

        // COMPROBAR VOTOS
        if (voto.qty < 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Los votos deben ser mayor o igual a 0'
            });
        }

        // COMPROVAR QUE EL ID ES VALIDO
        if (!ObjectId.isValid(mesa)) {
            return res.status(404).json({
                ok: false,
                msg: 'Error en el ID de la mesa'
            });
        }

        const mesaDB = await Mesa.findById(mesa);
        if (!mesaDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }

        const validar = mesaDB.votacion.findIndex( (votoDB) => {
            if( (String)(new ObjectId(votoDB.candidate._id)) === voto.candidate ){
              return true;
            }else{
              return false
            }
        });

        if (validar === -1) {
            
            // AGREGAR VOTO
            mesaDB.votacion.push({
                candidate: voto.candidate,
                qty: voto.qty,
                testigo: uid
            });
            
            // SUMAR VOTO EN TOTALES
            mesaDB.total = mesaDB.total + voto.qty;
            mesaDB.sufragantes = mesaDB.sufragantes + voto.qty;
            mesaDB.votosurnas = mesaDB.votosurnas + voto.qty;
    
            // GUARDAMOS LA INFORMACION
            mesaDB.save();
    
            // DEVOLVEMOS LA MESA
            const mesaUp = await Mesa.findById(mesa)
                .populate('center')
                .populate('votacion.candidate')
                .populate('votacion.testigo', 'email name cedula role address img status fecha uid')
                .populate('staff', 'email name cedula role address img status fecha uid');
    
            res.json({
                ok: true,
                mesa: mesaUp
            });
        }else{
            return res.status(400).json({
                ok: false,
                msg: 'Ya se registro votos de este candidato'
            });
        }


        
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
const updateMesa = async(req, res = response) => {
    
    try {

        const mid = req.params.id;

        // SEARCH MESA
        const mesaDB = await Mesa.findById(mid);
        if (!mesaDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }
        // SEARCH MESA

        // VALIDATE MESA
        const { votacion, ...campos } = req.body;

        // UPDATE
        const mesaUpdate = await Mesa.findByIdAndUpdate(mid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            mesa: mesaUpdate
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
 *  DELETE MESA
=========================================================================*/
const deleteMesa = async(req, res = response) => {
    
    try {
        const mid = req.params.id;
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
        const mesaDB = await Mesa.findById({ _id: mid });
        if (!mesaDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }
        // SEARCH CENTER

        // CHANGE STATUS
        if (mesaDB.status === true) {
            mesaDB.status = false;
        } else {
            mesaDB.status = true;
        }
        // CHANGE STATUS

        const mesaUpdate = await Mesa.findByIdAndUpdate(mid, mesaDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            mesa: mesaUpdate
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
    getMesas,
    createMesa,
    updateMesa,
    deleteMesa,
    getMesasId,
    addVotoMesa
};