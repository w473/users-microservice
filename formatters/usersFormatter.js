const User = require('../models/userModel');
const MUUID = require('uuid-mongodb');

/**
 * 
 * @param {User} user 
 */
exports.formatOne = (user, limited = false) => {
    ret = {
        'id': MUUID.from(user._id).toString(),
        'username': user.username,
        'longName': user.longName
    }
    if (!limited) {
        ret.isActive = user.isActive;
        ret.roles = user.roles;
        ret.locale = user.locale;
        ret.email = user.email;
    }
    return ret;
}

exports.formatAll = (users, limited = false) => {
    return users.map(user => exports.formatOne(user, limited));
}