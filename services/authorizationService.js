const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const client = jwksClient({
    strictSsl: false, // Default value
    jwksUri: 'http://localhost:5000/.well-known/jwks.json'
    // requestHeaders: {}, // Optional
    // requestAgentOptions: {}, // Optional
    // timeout: 30000, // Defaults to 30s
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
        if (key) {
            callback(null, key.getPublicKey());
        }
    });
}

exports.entry = (req, res, next) => {
    const authorizationHeader = req.header('Authorization');
    if (authorizationHeader) {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (token.length > 0) {
            try {
                return jwt.verify(token, getKey, { algorithm: 'RS512' }, (err, token) => {
                    if (err) {
                        return next(err);
                    }
                    req.user = token;
                    next();
                });
            } catch (next) {
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

exports.isUser = () => {
    return this.hasRole('USER');
}