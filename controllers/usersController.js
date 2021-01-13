const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const MUUID = require('uuid-mongodb');
const userFormatter = require('../formatters/userFormatter');

exports.add = (req, res, next) => {
    bcrypt
        .hash(req.body.password, 12)
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
        .then(result => {
            res.status(200).json({ message: 'New user added successfuly' });
            //TO DO email send
            //console.log(result.email);
        })
        .catch(err => {
            if (err.code = 11000) {
                return res.status(400).json(
                    { message: `${Object.keys(err.keyPattern)[0]} is duplicated` }
                );
            }
            next(err);
        });
}

exports.edit = async (req, res, next) => {
    if (req.body.password.length > 0) {
        req.body.password = await bcrypt.hash(req.body.password, 12);
    }
    User
        .findById(MUUID.from(req.user.id))
        .exec()
        .then(user => {
            if (!user) {
                return res.status(400).json({ message: `User does not exists` });
            }

            for (const [key, value] of Object.entries(req.body)) {
                switch (key) {
                    case 'password':
                        user.credentials.password = value;
                        user.credentials.activationCode = MUUID.v4().toString();
                        break;
                    case 'email':
                    // code block
                    default:
                        user[key] = value;
                }
            }
            return user.save();
        })
        .then(result => {
            console.log(result);
            //moze da sie zobaczyc na result co zmieniono?
            //wyslij MAILA jak new email!!
            return res.status(204).send();
        })
        .catch(err => {
            if (err.code = 11000) {
                return res.status(400).json(
                    { message: `${Object.keys(err.keyPattern)[0]} is duplicated` }
                );
            }
            next(err);
        });
}

exports.get = (req, res, next) => {
    let usersId = req.user.id;

    if (req.params.usersId && req.user.id != req.params.usersId) {
        if (req.user.roles.indexOf('ADMIN') === -1) {
            return res.status(403).json({ message: `Not Allowed` });
        }
        usersId = req.params.usersId;
    }
    console.log(usersId);
    User
        .findById(MUUID.from(usersId))
        .exec()
        .then(user => {
            if (!user) {
                return res.status(400).json({ message: `User does not exists` });
            }

            return res.status(200).json(
                { message: `User data found`, payload: userFormatter.formatOne(user) }
            );

        })
        .catch(err => next(err));
}

exports.remove = (req, res, next) => {
    //TODO
    /**
     * sessia i odczyt danych usera z sessji
     */
    let usersId = req.params.usersId;
    throw new Error('Not implemented');
}

exports.fetchByEmail = async (req, res, next) => {
    User
        .findOne({ 'email': req.params.email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(400).json({ message: `User does not exists` });
            }
            const userResponse = userFormatter.formatOne(user);
            if (req.params.validate) {
                if (req.body.password) {
                    if (bcrypt.compareSync(req.body.password, user.credentials.password)) {
                        return res.status(200).json({ message: `User data found`, payload: userResponse });
                    }
                    return res.status(400).json({ message: `User does not exists` });
                } else {
                    return res.status(404).json({ message: `Wrong Execution` });
                }
            }
            return res.status(200).json({ message: `User data found`, payload: userResponse });

        })
        .catch(err => next(err));
}