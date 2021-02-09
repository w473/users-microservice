const config = require('../config');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');
const client = jwksClient({
    strictSsl: config.auth.jwks.ssl,
    jwksUri: config.sso + config.auth.jwks.uri
});

function getKey(next) {
    return (header, callback) => {
        client.getSigningKey(header.kid, function (err, key) {
            if (key) {
                return callback(err, key.getPublicKey());
            }
            next(err);
        });
    }
}

const getToken = (req) => {
    const authorizationHeader = req.header('Authorization');
    if (authorizationHeader) {
        return req.header('Authorization').replace('Bearer ', '');
    }
    return '';
}

exports.hasRole = (role) => {
    return function (req, res, next) {
        const token = getToken(req);
        if (token.length > 0) {
            jwt.verify(
                token,
                getKey(next),
                { algorithm: config.auth.jwt.algorithm },
                (err, token) => {
                    if (err) {
                        return next(err);
                    }
                    req.user = token;

                    if (!Array.isArray(role)) {
                        role = [role];
                    }
                    if (role.filter(r => req.user.roles.lastIndexOf(r) !== -1).length === 0) {
                        return res.status(403).json({ message: `Not allowed - not enough privileges` });
                    }
                    next();
                }
            );
        } else {
            return res.status(403).json({ message: `Not allowed - no token` });
        }
    }
}

exports.isAdmin = () => {
    return this.hasRole('ADMIN');
}

exports.isSystem = () => {
    return this.hasRole('SYS');
}

exports.isUser = () => {
    return this.hasRole('USER');
}