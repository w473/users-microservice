const { Validator, ValidationError } = require('express-json-validator-middleware');
const addFormats = require("ajv-formats");

const schemas = {
    addUserSchema: {
        type: 'object',
        required: ['longName', 'username', 'locale', 'email'],
        additionalProperties: false,
        properties: {
            longName: {
                type: 'string'
            },
            username: {
                type: 'string'
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
                        type: 'string'
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
                type: 'string'
            },
            username: {
                type: 'string'
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
                        type: 'string'
                    }
                }

            }
        }
    }
};


const validator = new Validator({ allErrors: true, schemas: schemas });
addFormats(validator.ajv);

/**
 * 
 * @param {String} schemaName 
 */
module.exports = (schemaName) => {
    return validator.validate({ body: schemaName });
}
