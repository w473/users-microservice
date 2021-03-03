import { config as dotenvConfig } from 'dotenv'

dotenvConfig();

const getVar = (varName: string): string => {
  return String(process.env[varName])
}

const config = {
  env: getVar('ENV'),
  port: getVar('PORT'),
  logging: {
    graylog: getVar('GRAYLOG')
  },
  sso: getVar('SSO'),
  sysAuth: {
    app: getVar('SYS_AUTH_APP'),
    key: getVar('SYS_AUTH_KEY')
  },
  emailService: getVar('EMAIL_SERVICE'),
  db: {
    url: getVar('DB_URL'),
    login: getVar('DB_LOGIN'),
    password: getVar('DB_PASSWORD'),
    name: getVar('DB_NAME') + (getVar('ENV') == 'test' ? '_test' : '')
  },
  activationURL: getVar('ACTIVATION_URL')
};

export default config;