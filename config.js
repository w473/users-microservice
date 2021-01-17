const config = {
    env: 'dev',
    port: 80,
    logging: {
        graylog: {
            host: 'graylog',
            port: 12201
        }
    },
    sso: 'http://sso:5000',
    sysAuth: {
        app: 'users',
        key: 'users_password'
    },
    auth: {
        jwks: {
            ssl: false,
            uri: this.sso + '/.well-known/jwks.json'
        },
        jwt: {
            algorithm: 'RS512'
        }
    },
    emailService: 'http://mailer',
    db: {
        url: (process.env.ENV == 'test')
            ? 'mongodb://user:pass@localhost/test?retryWrites=true&authSource=admin'
            : 'mongodb://user:pass@mongo/users?retryWrites=true&authSource=admin'
    },
    activationURL: 'http://something.local/{{activationCode}}'
};

module.exports = config;