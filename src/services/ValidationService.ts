import { Validator } from 'express-json-validator-middleware'
import addFormats from 'ajv-formats'

const schemas = {
  addUserSchema: {
    type: 'object',
    required: ['name', 'familyName', 'username', 'locale', 'email'],
    additionalProperties: false,
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 256
      },
      familyName: {
        type: 'string',
        minLength: 3,
        maxLength: 256
      },
      username: {
        type: 'string',
        minLength: 5,
        maxLength: 256
      },
      locale: {
        type: 'string',
        pattern: '^[a-z][a-z]_[A-Z][A-Z]$'
      },
      email: {
        type: 'string',
        format: 'email'
      },
      credentials: {
        type: 'object',
        required: ['password'],
        properties: {
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 256
          }
        }
      }
    }
  },
  editUserSchema: {
    type: 'object',
    additionalProperties: false,
    minProperties: 1,
    properties: {
      name: {
        type: 'string',
        minLength: 3,
        maxLength: 256
      },
      familyName: {
        type: 'string',
        minLength: 3,
        maxLength: 256
      },
      username: {
        type: 'string',
        minLength: 5,
        maxLength: 256
      },
      locale: {
        type: 'string',
        pattern: '^[a-z][a-z]_[A-Z][A-Z]$'
      },
      email: {
        type: 'string',
        format: 'email'
      }
    }
  },
  emailAndPassword: {
    type: 'object',
    additionalProperties: false,
    required: ['password', 'email'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 256
      }
    }
  },
  email: {
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
      email: {
        type: 'string',
        format: 'email'
      }
    }
  },
  passwordChangeSchema: {
    type: 'object',
    required: ['passwordOld', 'passwordNew'],
    additionalProperties: false,
    properties: {
      passwordOld: {
        type: 'string',
        minLength: 8,
        maxLength: 256
      },
      passwordNew: {
        type: 'string',
        minLength: 8,
        maxLength: 256
      }
    }
  }
}

const validator = new Validator({ allErrors: true, schemas: schemas })
addFormats(validator.ajv)

export default function validate (schemaName: String) {
  return validator.validate({ body: schemaName })
}
