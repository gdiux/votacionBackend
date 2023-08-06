const { Schema, model } = require('mongoose');

const privSchema = Schema({

    cierre: {
        type: Boolean,
        default: true
    }

});

const UserSchema = Schema({

    usuario: {
        type: String,
        require: true,
        unique: true
    },

    name: {
        type: String,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    privilegios: [privSchema],

    role: {
        type: String,
        default: 'STAFF',
        require: true
    },

    address: {
        type: String
    },

    img: {
        type: String
    },

    mesero: {
        type: Boolean,
        default: false
    },

    cerrada: {
        type: Boolean,
        default: true
    },

    turno: {
        type: Schema.Types.ObjectId,
        ref: 'Turno'
    },

    valid: {
        type: Boolean,
        default: false
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

UserSchema.method('toJSON', function() {

    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;

});

module.exports = model('User', UserSchema);