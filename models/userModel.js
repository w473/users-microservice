const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MUUID = require('uuid-mongodb');

const userSchema = new Schema({
    _id: {
        type: 'object',
        value: { type: 'Buffer' },
        default: () => MUUID.v4(),
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    longName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    locale: {
        type: String,
        required: true
    },
    credentials: {
        password: {
            type: String,
            required: false
        },
        activationCode: {
            type: String,
            required: false
        }
        //placeholder for fb/google login stuff
    },
    roles: {
        type: Array,
        required: true,
        default: ['USER']
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);