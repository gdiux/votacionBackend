const { response } = require('express');
const bcrypt = require('bcryptjs');

const Candidate = require('../models/candidates.model');
const User = require('../models/users.model');

/** =====================================================================
 *  GET CANDIDATES
=========================================================================*/
const getCandidates = async(req, res) => {

    try {

        const { desde, hasta, ...query } = req.body;

        const [candidates, total] = await Promise.all([
            Candidate.find(query)
            .limit(hasta)
            .skip(desde),
            Candidate.countDocuments()
        ]);

        res.json({
            ok: true,
            candidates,
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
 *  GET CANDIDATE ID
=========================================================================*/
const getCandidateId = async(req, res = response) => {

    try {
        const id = req.params.id;

        const candidateDB = await Candidate.findById(id)
            .populate('User');
        if (!candidateDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun candidato con este ID'
            });
        }

        res.json({
            ok: true,
            center: candidateDB
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
 *  CREATE CANDIDATE
=========================================================================*/
const createCandidate = async(req, res = response) => {

    
    try {
        
        const candidate = new Candidate(req.body);

        candidate.cedula = candidate.cedula.trim();
        candidate.name = candidate.name.trim();

        const validarCandidate = await Candidate.findOne({ cedula: candidate.cedula });

        if (validarCandidate) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un candidato con este numero de cedula'
            });
        }        

        // SAVE CANDIDATE
        await candidate.save();

        res.json({
            ok: true,
            candidate
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
 *  UPDATE CANDIDATE
=========================================================================*/
const updateCandidate = async(req, res = response) => {
    
    try {

        const caid = req.params.id;

        // SEARCH CANDIDATE
        const candidateDB = await Candidate.findById(caid);
        if (!candidateDB) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun candidato con este ID'
            });
        }
        // SEARCH CANDIDATE

        // VALIDATE CANDIDATE
        const { ...campos } = req.body;
        campos.cedula = campos.cedula.trim();

        if (candidateDB.cedula !== campos.cedula) {
            const validarCandidate = await Candidate.findOne({ cedula: campos.cedula });
            if (validarCandidate) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con este numero de cedula'
                });
            }
        }

        // UPDATE
        const candidateUpdate = await Candidate.findByIdAndUpdate(caid, campos, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            candidate: candidateUpdate
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
 *  DELETE CANDIDATE
=========================================================================*/
const deleteCandidate = async(req, res = response) => {
    
    try {
        const caid = req.params.id;
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
                    msg: 'No tienes los privilegios para editar este candidato'
                });
            }
        }
        // SEARCH USER
        
        // SEARCH CANDIDATE
        const candidateDB = await Candidate.findById({ _id: caid });
        if (!candidateDB) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe ningun candidato con este ID'
            });
        }
        // SEARCH CANDIDATE

        // CHANGE STATUS
        if (candidateDB.status === true) {
            candidateDB.status = false;
        } else {
            candidateDB.status = true;
        }
        // CHANGE STATUS

        const candidateUpdate = await Candidate.findByIdAndUpdate(caid, candidateDB, { new: true, useFindAndModify: false });

        res.json({
            ok: true,
            candidate: candidateUpdate
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
    getCandidates,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    getCandidateId
};