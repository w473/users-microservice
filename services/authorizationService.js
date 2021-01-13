const config = require('../config');
const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const client = jwksClient({
    strictSsl: config.auth.jwks.ssl,
    jwksUri: config.auth.jwks.uri
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (key) {
            callback(null, key.getPublicKey());
        }
    });
}

exports.jwtVerifyMiddleware = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    if (authorizationHeader) {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (token.length > 0) {
            try {
                return jwt.verify(
                    token,
                    getKey,
                    { algorithm: config.auth.jwt.algorithm },
                    (err, token) => {
                        if (err) {
                            return next(err);
                        }
                        req.user = token;
                        next();
                    }
                );
            } catch (error) {
                next(error);
            }
        }
    }
    return res.status(403).json(
        { message: `Not allowed - no token` }
    );
};

exports.hasRole = (role) => {
    return function (req, res, next) {
        if (!Array.isArray(role)) {
            role = [role];
        }

        if (role.filter(r => req.user.roles.lastIndexOf(r) !== -1).length === 0) {
            return res.status(403).json({ message: `Not allowed - not enough privileges` });
        }
        next();
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