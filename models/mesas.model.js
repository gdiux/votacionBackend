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

const VotacionSchema = Schema({

    candidate: {
        type: Schema.Types.ObjectId,
        ref: 'Candidates'
    },

    qty: {
        type: Number
    },
    
    testigo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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
    votacion: [VotacionSchema],
    
    status: {
        type: Boolean,
        default: false
    },

    open: {
        type: Boolean,
        default: false
    },

    total: {
        type: Number,
        default: 0
    },

    sufragantes: {
        type: Number,
        default: 0
    },

    votosurnas: {
        type: Number,
        default: 0
    },

    blancos: {
        type: Number,
        default: 0
    },

    nulos: {
        type: Number,
        default: 0
    },

    incinerados: {
        type: Number,
        default: 0
    },

    recuento: {
        type: Boolean,
        default: false
    },

    nota: {
        type: String
    },

    log: [LogSchema]

});

MesaSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.mid = _id;
    return object;
});

module.exports = model('mesas', MesaSchema);