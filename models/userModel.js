const mongoose = require('mongoose');
require('mongoose-uuid2')(mongoose);

const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: {
        type: mongoose.Types.UUID,
        required: true,
        default: uuidv4
    },
    textId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);