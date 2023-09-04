const { Schema, model } = require('mongoose');

const VotoSchema = Schema({

    candidate: {
        type: Schema.Types.ObjectId,
        ref: 'Candidates'
    },

    mesa: {
        type: Schema.Types.ObjectId,
        ref: 'mesas'
    },
    
    status: {
        type: Boolean,
        default: false
    },

    qty: {
        type: Number,
        require: true
    },

    fecha: {
        type: Date,
        default: Date.now
    }

});

VotoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.vid = _id;
    return object;
});

module.exports = model('votos', VotoSchema);