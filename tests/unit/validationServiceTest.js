const validate = require('../../services/validationService');
const httpMocks = require('node-mocks-http');

const { assert } = require('chai');

it('validate addUserSchema Error', function () {
    const tests = [
        {
            body: {},
            errors: [
                "should have required property 'longName'",
                "should have required property 'username'",
                "should have required property 'locale'",
                "should have required property 'email'"
            ],
            count: 4
        },
        {
            body: {
                'longName': 'po',
                'username': 'potato',
                'locale': 'potato',
                'email': '',
                'credentials': '',
                'dasdads': ''
            },
            errors: [
                "should NOT have additional properties",
                "should NOT have fewer than 5 characters",
                'should match pattern "^[a-z][a-z]_[A-Z][A-Z]$"',
                'should match format "email"',
                'should be object'
            ],
            count: 5
        },
        {
            body: {
                'longName': 'poasfdadasd',
                'username': 'potasdasdasd',
                'locale': 'pl_PL',
                'email': 'aa@ee.pl',
                'credentials': {
                    'password': ''
                }
            },
            errors: [
                "should NOT have fewer than 8 characters",
            ],
            count: 1
        }

    ]

    testValidateError('addUserSchema', tests);
});

it('validate addUserSchema Ok', function () {

    body = {
        'longName': 'poasfdadasd',
        'username': 'potasdasdasd',
        'locale': 'pl_PL',
        'email': 'aa@ee.pl',
        'credentials': {
            'password': 'asasdasdasd'
        }
    };

    testValidateOk('addUserSchema', body);
});

it('validate editUserSchema Error', function () {
    const tests = [
        {
            body: {},
            errors: [
                "should NOT have fewer than 1 items"
            ],
            count: 1
        },
        {
            body: {
                'longName': 'po',
                'username': 'potato',
                'locale': 'potato',
                'email': '',
                'credentials': '',
                'dasdads': ''
            },
            errors: [
                "should NOT have additional properties",
                "should NOT have fewer than 5 characters",
                'should match pattern "^[a-z][a-z]_[A-Z][A-Z]$"',
                'should match format "email"',
                'should be object'
            ],
            count: 5
        },
        {
            body: {
                'sasda': 'ASAS',
                'longName': 'poasfdadasd',
                'username': 'potasdasdasd',
                'locale': 'pl_PL',
                'email': 'aa@ee.pl',
                'credentials': {
                    'password': ''
                }
            },
            errors: [
                'should NOT have additional properties',
                "should NOT have fewer than 8 characters"
            ],
            count: 2
        }
    ]

    testValidateError('editUserSchema', tests);

});

it('validate editUserSchema Ok', function () {
    body = {
        'longName': 'poasfdadasdss'
    };
    testValidateOk('editUserSchema', body);

});

it('validate emailAndPassword Error', function () {

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    const tests = [
        {
            body: {},
            errors: [
                "should have required property 'password'",
                "should have required property 'email'"
            ],
            count: 2
        },
        {
            body: {
                'email': 'asda',
                'password': 'asda',
                'asdaspassword': 'asda'
            },
            errors: [
                'should NOT have additional properties',
                'should match format "email"',
                'should NOT have fewer than 8 characters'
            ],
            count: 3
        }
    ]

    testValidateError('emailAndPassword', tests);

});

it('validate emailAndPassword Ok', function () {
    body = {
        'email': 'aaaa@eeee.pl',
        'password': 'zfsafasfasfd'
    };

    testValidateOk('emailAndPassword', body);
});


it('validate email Error', function () {
    const tests = [
        {
            body: {},
            errors: [
                "should have required property 'email'"
            ],
            count: 1
        },
        {
            body: {
                'email': 'asdads',
                'templateId': 'asda'
            },
            errors: [
                'should NOT have additional properties',
                'should match format "email"'
            ],
            count: 2
        }
    ]

    testValidateError('email', tests);

});

it('validate email Ok', function () {
    body = {
        'email': 'email@email.de'
    };
    testValidateOk('email', body);
});

/**
 * 
 * @param {String} schemaName 
 * @param {Array} tests 
 */
const testValidateError = (schemaName, tests) => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    tests.forEach(data => {
        req.body = data.body;
        const next = (err) => {
            assert.typeOf(err, 'error');
            assert.equal(err.name, 'JsonSchemaValidationError');
            data.errors.forEach((error, index) => {
                assert.equal(err.validationErrors.body[index].message, error);
            })
            assert.equal(data.count, err.validationErrors.body.length)
        }
        validate(schemaName)(req, res, next)
    });
}
/**
 * 
 * @param {String} schemaName 
 * @param {Object} body 
 */
const testValidateOk = (schemaName, body) => {
    const req = httpMocks.createRequest();
    req.body = body;
    const res = httpMocks.createResponse();
    const next = (err) => {
        assert.equal(err, undefined);
    }
    validate(schemaName)(req, res, next)
}