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
      uri: '/.well-known/jwks.json'
    },
    jwt: {
      algorithm: 'RS512'
    }
  },
  emailService: 'http://mailer',
  db: {
    url: 'http://127.0.0.1:8529',
    login: 'root',
    password: 'pass',
    name: process.env.ENV == 'test' ? 'user_test' : 'user'
  },
  activationURL: 'http://localhost:8080/activate/{{activationCode}}'
};

export default config;