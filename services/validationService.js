const { Validator, ValidationError } = require('express-json-validator-middleware');
const addFormats = require("ajv-formats");

const schemas = {
    addUserSchema: {
        type: 'object',
        required: ['longName', 'username', 'locale', 'email'],
        additionalProperties: false,
        properties: {
            longName: {
                type: 'string',
                minLength: 5,
                maxLength: 256
            },
            username: {
                type: 'string',
                minLength: 5,
                maxLength: 256
            },
            locale: {
                type: 'string',
                pattern: "^[a-z][a-z]_[A-Z][A-Z]$"
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
            longName: {
                type: 'string',
                minLength: 5,
                maxLength: 256
            },
            username: {
                type: 'string',
                minLength: 5,
                maxLength: 256
            },
            locale: {
                type: 'string',
                pattern: "^[a-z][a-z]_[A-Z][A-Z]$"
            },
            email: {
                type: 'string',
                format: 'email'
            },
            credentials: {
                type: 'object',
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
};


const validator = new Validator({ allErrors: true, schemas: schemas });
addFormats(validator.ajv);

/**
 * 
 * @param {String} schemaName 
 */
exports.validate = (schemaName) => {
    return validator.validate({ body: schemaName });
}
