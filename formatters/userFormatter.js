const User = require('../models/userModel');

/**
 * 
 * @param {User} user 
 */
exports.formatOne = (user) => {
    return {
        'id': MUUID.from(user._id).toString(),
        'roles': user.roles,
        'isActive': user.isActive,
        'username': user.username,
        'longName': user.longName,
        'locale': user.locale,
        'email': user.email
    }
}

exports.formatAll = (users) => {
    return users.map(user => exports.formatOne(user));
}