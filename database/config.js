const mongoose = require('mongoose');

/**
 * The function `dbConnection` connects to a MongoDB database using the `mongoose` library and
 * initializes the `autoIncrement` plugin.
 */
const dbConection = async() => {

    try {

        /* The code `const connection = await mongoose.connect(process.env.DB_CNN, { useNewUrlParser:
        true, useUnifiedTopology: true, useCreateIndex: true });` is establishing a connection to a
        MongoDB database using the `mongoose` library. */
        const connection = await mongoose.connect(process.env.DB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('DB Online');

    } catch (error) {
        console.log(error);
        throw new Error('Error al iniciar la BD');
    }

};

module.exports = {
    dbConection
};