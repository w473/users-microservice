const { Validator, ValidationError } = require('express-json-validator-middleware');
const validator = new Validator({ allErrors: true });

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

exports.validate = (schemaName) => {
    return validator.validate({ body: schemas[schemaName] });
}
