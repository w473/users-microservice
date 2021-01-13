const config = {
    port: 3001,
    auth: {
        jwks: {
            ssl: false,
            uri: 'http://localhost:5000/.well-known/jwks.json'
        },
        jwt: {
            algorithm: 'RS512'
        }
    },
    emailService: 'http://127.0.0.1:3000',
    db: {
        url: 'mongodb://user:pass@localhost/users?retryWrites=true&authSource=admin',
        name: (process.env.ENV == 'test') ? 'test' : 'users'
    }
};
module.exports = config;