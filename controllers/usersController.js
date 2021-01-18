const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const MUUID = require('uuid-mongodb');
const usersFormatter = require('../formatters/usersFormatter');
const emailService = require('../services/emailService');

exports.add = (req, res, next) => {
    return bcrypt
        .hash(req.body.credentials.password, 12)
        .then(password => {
            const user = new User({
                "longName": req.body.longName,
                "username": req.body.username,
                "locale": req.body.locale,
                "credentials": {
                    'password': password,
                    "activationCode": MUUID.v4().toString()
                },
                "email": req.body.email
            });
            return user.save();
        })
        .then(user => {
            res.status(204).send();
            return emailService.sendNewUser(user);
        })
        .catch(err => {
            if (err.code === 11000) {
                return res.status(400).json(
                    { message: `Field "${Object.keys(err.keyPattern)[0]}" is not unique` }
                );
            }
            next(err);
        });
}

exports.edit = async (req, res, next) => {
    try {
        const user = await User.findById(MUUID.from(req.user.id));
        if (!user) {
            return res.status(404).json({ message: `User does not exists` });
        }
        if (req.body.password && req.body.password.length > 0) {
            req.body.password = await bcrypt.hash(req.body.password, 12);
        }
        let newEmail = false;

        for (const [key, value] of Object.entries(req.body)) {
            switch (key) {
                case 'email':
                    newEmail = value != user.email;
                    if (newEmail) {
                        user.isActive = false;
                        user.credentials.activationCode = MUUID.v4().toString();
                    }
                default:
                    user[key] = value;
            }
        }
        await user.save();

        if (newEmail) {
            res.status(200).json({ message: 'Account needs to activated after email change' });
            return emailService.sendNewEmail(user);
        }
        res.status(204).send();
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json(
                { message: `Field "${Object.keys(err.keyPattern)[0]}" is not unique` }
            );
        }
        next(err);
    }
}

exports.get = (req, res, next) => {
    let usersId = req.user.id;

    if (req.params.usersId && req.user.id != req.params.usersId) {
        if (req.user.roles.indexOf('ADMIN') === -1) {
            return res.status(403).json({ message: `Not Allowed` });
        }
        usersId = req.params.usersId;
    }
    return User
        .findById(MUUID.from(usersId))
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: `User does not exists` });
            }
            return res.status(200).json(
                usersFormatter.formatOne(user)
            );
        })
        .catch(err => next(err));
}

exports.delete = (req, res, next) => {
    let usersId = req.user.id;
    if (req.params.usersId && req.user.id != req.params.usersId) {
        if (req.user.roles.indexOf('ADMIN') === -1) {
            return res.status(403).json({ message: `Not Allowed` });
        }
        usersId = req.params.usersId;
    }

    return User
        .deleteOne({ '_id': MUUID.from(usersId) })
        .exec()
        .then(result => {
            if (result.deletedCount === 1) {
                return res.status(204).send();
            }
            return res.status(404).json({ message: `User has not been found` });
        })
        .catch(err => next(err));
}

exports.setRoles = (req, res, next) => {
    const usersId = req.params.usersId;
    if (usersId == req.user.id || req.body.roles.lastIndexOf('SYS') !== -1) {
        return res.status(403).json({ message: `Not Allowed` });
    }
    req.body.roles.push('USER');
    const roles = [...new Set(req.body.roles)];

    return User
        .findById(MUUID.from(usersId))
        .exec()
        .then(user => {
            if (user) {
                user.roles = roles;
                return user.save();
            }
        })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: `User does not exists` });
            }
            return res.status(204).send();
        })
        .catch(err => next(err));
}

exports.activate = (req, res, next) => {
    return User
        .findOne({ 'credentials.activationCode': req.params.activationCode })
        .exec()
        .then(user => {
            if (user) {
                user.credentials.activationCode = undefined;
                user.isActive = true;
                return user.save();
            }
        })
        .then(result => {
            if (result) {
                return res.status(204).send();
            }
            return res.status(404).json({ message: `User has not been found` });
        })
        .catch(err => next(err));
}

exports.find = async (req, res, next) => {
    const where = {};
    return User
        .find(where)
        .exec()
        .then(users => {
            return res.status(200).json(
                {
                    users: usersFormatter.formatAll(users, true),
                    total: 666
                }
            );
        })
        .catch(err => next(err));
}

exports.findByEmail = async (req, res, next) => {
    return User
        .findOne({ 'email': req.body.email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: `User does not exists` });
            }
            return res.status(200).json(usersFormatter.formatOne(user));
        })
        .catch(err => next(err));
}

exports.findByEmailPassword = async (req, res, next) => {
    return User
        .findOne({ 'email': req.body.email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: `User does not exist` });
            }
            if (bcrypt.compareSync(req.body.password, user.credentials.password)) {
                return res.status(200).json(usersFormatter.formatOne(user));
            }
            return res.status(400).json({ message: `User does not exists` });
        })
        .catch(err => next(err));
}