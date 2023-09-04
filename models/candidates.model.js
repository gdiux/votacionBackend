const { Schema, model } = require('mongoose');

const CandidateSchema = Schema({

    name: {
        type: String,
        require: true
    },

    cedula: {
        type: String,
        require: true
    },

    department: {
        type: String
    },
    city: {
        type: String
    },
    address: {
        type: String
    },

    img: {
        type: String
    },
    
    votos: {
        type: Number,
        default: 0
    },

    status: {
        type: Boolean,
        default: true
    },

    fecha: {
        type: Date,
        default: Date.now
    }

});

CandidateSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.caid = _id;
    return object;

});

module.exports = model('Candidates', CandidateSchema);