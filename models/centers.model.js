const { Schema, model } = require('mongoose');

const CentersSchema = Schema({

    code: {
        type: String
    },

    name: {
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

    comuna: {
        type: String
    },

    img: {
        type: String
    },

    lat: {
        type: Number
    },
    lng: {
        type: Number
    },

    total: {
        type: Number,
        default: 0
    },

    status: {
        type: Boolean,
        default: true
    }

});

CentersSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.ceid = _id;
    return object;

});

module.exports = model('Centers', CentersSchema);