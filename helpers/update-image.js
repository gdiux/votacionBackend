const fs = require('fs');

// MODELS
const User = require('../models/users.model');
const Candidate = require('../models/candidates.model');

/** =====================================================================
 *  DELETE IMAGE
=========================================================================*/
const deleteImage = (path) => {

    // VALIDATE IMAGE
    if (fs.existsSync(path)) {
        // DELET IMAGE OLD
        fs.unlinkSync(path);
    }

};

/** =====================================================================
 *  DELETE IMAGE
=========================================================================*/


/** =====================================================================
 *  UPDATE IMAGE 
=========================================================================*/
const updateImage = async(tipo, id, nameFile, desc) => {

    let pathOld = '';

    switch (tipo) {
        case 'user':

            // SEARCH USER BY ID
            const user = await User.findById(id);
            if (!user) {
                return false;
            }

            // VALIDATE IMAGE
            pathOld = `./uploads/user/${ user.img }`;
            deleteImage(pathOld);

            // SAVE IMAGE
            user.img = nameFile;
            await user.save();
            return true;

            break;

        case 'candidate':

            // SEARCH CANDIDATE BY ID
            const candidate = await Candidate.findById(id);
            if (!candidate) {
                return false;
            }

            // VALIDATE IMAGE
            pathOld = `./uploads/candidate/${ candidate.img }`;
            deleteImage(pathOld);

            // SAVE IMAGE
            candidate.img = nameFile;
            await candidate.save();
            return true;

            break;

        default:
            break;
    }


};
/** =====================================================================
 *  UPDATE IMAGE
=========================================================================*/




// EXPORT
module.exports = {
    updateImage
};