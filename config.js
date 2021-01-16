const config = {
    sso: 'http://localhost:5000',
    sysAuth: {
        app: 'users',
        key: 'users_password'
    },
    port: 3001,
    auth: {
        jwks: {
            ssl: false,
            uri: this.sso + '/.well-known/jwks.json'
        },
        jwt: {
            algorithm: 'RS512'
        }
    },
    emailService: 'http://127.0.0.1:3000',
    db: {
        url: (process.env.ENV == 'test')
            ? 'mongodb://user:pass@localhost/test?retryWrites=true&authSource=admin'
            : 'mongodb://user:pass@localhost/users?retryWrites=true&authSource=admin'
    },
    activationURL: 'http://something.local/{{activationCode}}'
};

module.exports = config;