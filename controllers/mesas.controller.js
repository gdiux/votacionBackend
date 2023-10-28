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
 *  GET MESAS CENTERS
=========================================================================*/
const getMesasCenters = async(req, res = response) => {

    try {

        const { desde, hasta } = req.body;
        
        let centers = [];
        centers = req.body.centros;

        const ids = [];

        for (const centro of centers) {
            ids.push(centro)
        }

        let query = {
            center: {
                $in: ids
            }
        }

        const [mesas, total] = await Promise.all([
            Mesa.find()
            .populate('center')
            .populate('votacion.candidate')
            .populate('votacion.testigo', 'email name cedula role address img status fecha uid')
            .populate('staff', 'email name cedula role address img status fecha uid')
            .limit(hasta)
            .skip(desde)
            .where('center').in(ids).exec(),
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

        const uid = req.uid;
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

        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            if ( (String)(new ObjectId(user._id)) !== (String)(new ObjectId(mesaDB.staff._id))) {
                return res.status(403).json({
                    ok: false,
                    msg: 'No tienes la authorizacion necesaria'
                });                
            }
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

        const uid = req.uid;
        
        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                ok: false,
                msg: 'No tienes la authorizacion necesaria'
            });
        }

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
        const mesaDB = await Mesa.findById(mesa._id)
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

        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            if ((String)(new ObjectId(user._id)) !== (String)(new ObjectId(mesaDB.staff))) {
                return res.status(403).json({
                    ok: false,
                    msg: 'No tienes la authorizacion necesaria'
                });                
            }else{
                if (!mesaDB.open) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La mesa esta cerrada y no puedes agregar votos'
                    });
                }
            }

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
    
            let campos = {
                total: mesaDB.total,
                sufragantes: mesaDB.sufragantes,
                votosurnas: mesaDB.votosurnas,
                votacion: mesaDB.votacion
            }

            // UPDATE
            await Mesa.findByIdAndUpdate(mesa, campos, { new: true, useFindAndModify: false });
    
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
 *  DELETE VOTO
=========================================================================*/
const delVoto = async(req, res = response) => {

    try {
        
        const mid   = req.params.mid;
        const voto  = req.params.voto;
        const qty   = Number(req.params.qty);
        const uid   = req.uid;

        // COMPROVAR QUE EL ID ES VALIDO
        if (!ObjectId.isValid(mid)) {
            return res.status(404).json({
                ok: false,
                msg: 'Error en el ID de la mesa'
            });
        }

        const mesa = await Mesa.findById(mid)

        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            if ((String)(new ObjectId(user._id)) !== (String)(new ObjectId(mesa.staff))) {
                return res.status(403).json({
                    ok: false,
                    msg: 'No tienes la authorizacion necesaria'
                });                
            }else{
                if (!mesa.open) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La mesa esta cerrada y no puedes eliminar votos'
                    });
                }
            }

        }

        const deleteVoto = await Mesa.updateOne({ _id: mid }, { $pull: { votacion: { _id: voto } } });

        // VERIFICAR SI SE ACTUALIZO
        if (deleteVoto.nModified === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No se pudo eliminar este voto, porfavor intente de nuevo'
            });
        }       

        // RESTAR VOTO EN TOTALES
        mesa.total = mesa.total - qty;
        mesa.sufragantes = mesa.sufragantes - qty;
        mesa.votosurnas = mesa.votosurnas - qty;
        
        let campos = {
            total: mesa.total,
            sufragantes: mesa.sufragantes,
            votosurnas: mesa.votosurnas
        }

        // UPDATE
        await Mesa.findByIdAndUpdate(mid, campos, { new: true, useFindAndModify: false });

        const mesaDB = await Mesa.findById(mid)
            .populate('center')
            .populate('votacion.candidate')
            .populate('votacion.testigo', 'email name cedula role address img status fecha uid')
            .populate('staff', 'email name cedula role address img status fecha uid');

        

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
 *  UPDATE MESA
=========================================================================*/
const updateMesa = async(req, res = response) => {
    
    try {

        const mid = req.params.id;
        const uid = req.uid;

        // SEARCH MESA
        const mesaDB = await Mesa.findById(mid);
        if (!mesaDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna mesa de votación con este ID'
            });
        }
        // SEARCH MESA

        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            if ((String)(new ObjectId(user._id)) !== (String)(new ObjectId(mesaDB.staff))) {
                return res.status(403).json({
                    ok: false,
                    msg: 'No tienes la authorizacion necesaria'
                });                
            }else{
                if (!mesaDB.open) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'La mesa esta cerrada y no se puede modificar'
                    });
                }
            }
        }

        // VALIDATE MESA
        const { votacion, open, ...campos } = req.body;

        // ABRIR O CERRAR MESA
        if (open !== undefined) {            
            if (open === false ) {
                campos.open = true;
            }else{
                campos.open = false;
            }
        }

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
 *  OPEN MESA
=========================================================================*/
const openAllMesas = async(req, res = response) => {

    try {

        const uid = req.uid;

        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                ok: false,
                msg: 'No tienes la authorizacion necesaria'
            });
        }

        const mesas = await Mesa.find();

        for (const mesa of mesas) {            
            await Mesa.findByIdAndUpdate(mesa._id, {open: true}, { new: true, useFindAndModify: false });
        }

        res.json({
            ok: true,
            msg: 'Todas las mesas se han aperturado exitosamente!'
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

        // AUTHORIZE
        const user = await User.findById(uid);
        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                ok: false,
                msg: 'No tienes la authorizacion necesaria'
            });
        }
        
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
    addVotoMesa,
    delVoto,
    openAllMesas,
    getMesasCenters
};