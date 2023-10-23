const { Schema, model } = require('mongoose');

const LogSchema = Schema({
    description: {
        type: String
    },
    staff: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    fecha: {
        type: Date,
        default: Date.now
    }

});

const EvidenciasSchema = Schema({
    titulo: {
        type: String
    },
    img: {
        type: String
    },
    fecha: {
        type: Date,
        default: Date.now
    },
});

const MesaSchema = Schema({

    number: {
        type: Number
    },

    staff: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },

    center: {
        type: Schema.Types.ObjectId,
        ref: 'Centers'
    },

    evidencias: [EvidenciasSchema],
    
    status: {
        type: Boolean,
        default: false
    },

    open: {
        type: Boolean,
        default: false
    },

    log: [LogSchema]

});

MesaSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.mid = _id;
    return object;
});

module.exports = model('mesas', MesaSchema);