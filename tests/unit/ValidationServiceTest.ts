import validate from '../../src/services/ValidationService';
import httpMocks from 'node-mocks-http';

import { assert } from 'chai';
import { ValidationError } from 'express-json-validator-middleware';

it('validate addUserSchema Error', function () {
  const tests = [
    {
      body: {},
      errors: [
        "should have required property 'name'",
        "should have required property 'familyName'",
        "should have required property 'username'",
        "should have required property 'locale'",
        "should have required property 'email'"
      ],
      count: 5
    },
    {
      body: {
        name: 'po',
        familyName: 'po',
        username: 'potato',
        locale: 'potato',
        email: '',
        credentials: '',
        dasdads: ''
      },
      errors: [
        'should NOT have additional properties',
        'should NOT have fewer than 3 characters',
        'should NOT have fewer than 3 characters',
        'should match pattern "^[a-z][a-z]_[A-Z][A-Z]$"',
        'should match format "email"',
        'should be object'
      ],
      count: 6
    },
    {
      body: {
        name: 'poasfdadasd',
        familyName: 'poasfdadasd',
        username: 'potasdasdasd',
        locale: 'pl_PL',
        email: 'aa@ee.pl',
        credentials: {
          password: ''
        }
      },
      errors: ['should NOT have fewer than 8 characters'],
      count: 1
    }
  ];

  testValidateError('addUserSchema', tests);
});

it('validate addUserSchema Ok', function () {
  const body = {
    name: 'poasfdadasd',
    familyName: 'poasfdadasd',
    username: 'potasdasdasd',
    locale: 'pl_PL',
    email: 'aa@ee.pl',
    credentials: {
      password: 'asasdasdasd'
    }
  };

  testValidateOk('addUserSchema', body);
});

it('validate editUserSchema Error', function () {
  const tests = [
    {
      body: {},
      errors: ['should NOT have fewer than 1 items'],
      count: 1
    },
    {
      body: {
        name: 'po',
        familyName: 'po',
        username: 'potato',
        locale: 'potato',
        email: '',
        dasdads: ''
      },
      errors: [
        'should NOT have additional properties',
        'should NOT have fewer than 3 characters',
        'should NOT have fewer than 3 characters',
        'should match pattern "^[a-z][a-z]_[A-Z][A-Z]$"',
        'should match format "email"'
      ],
      count: 5
    },
    {
      body: {
        sasda: 'ASAS',
        name: 'poasfdadasd',
        familyName: 'poasfdadasd',
        username: 'poasfdadasd',
        locale: 'pl_PL',
        email: 'aa@ee.pl'
      },
      errors: [
        'should NOT have additional properties'
      ],
      count: 1
    }
  ];

  testValidateError('editUserSchema', tests);
});

it('validate editUserSchema Ok', function () {
  const body = {
    familyName: 'poasfdadasdss'
  };
  testValidateOk('editUserSchema', body);
});

it('validate emailAndPassword Error', function () {
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
        email: 'asda',
        password: 'asda',
        asdaspassword: 'asda'
      },
      errors: [
        'should NOT have additional properties',
        'should match format "email"',
        'should NOT have fewer than 8 characters'
      ],
      count: 3
    }
  ];

  testValidateError('emailAndPassword', tests);
});

it('validate emailAndPassword Ok', function () {
  const body = {
    email: 'aaaa@eeee.pl',
    password: 'zfsafasfasfd'
  };

  testValidateOk('emailAndPassword', body);
});

it('validate email Error', function () {
  const tests = [
    {
      body: {},
      errors: ["should have required property 'email'"],
      count: 1
    },
    {
      body: {
        email: 'asdads',
        templateId: 'asda'
      },
      errors: [
        'should NOT have additional properties',
        'should match format "email"'
      ],
      count: 2
    }
  ];

  testValidateError('email', tests);
});

it('validate email Ok', function () {
  const body = {
    email: 'email@email.de'
  };
  testValidateOk('email', body);
});

const testValidateError = (schemaName: string, tests: Array<any>) => {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();
  tests.forEach((data) => {
    req.body = data.body;
    const next = (err: any) => {
      assert.typeOf(err, 'error');
      assert.equal(err.name, 'JsonSchemaValidationError');
      data.errors.forEach((error: ValidationError, index: number) => {
        assert.equal(err.validationErrors.body[index].message, error);
      });
      assert.equal(data.count, err.validationErrors.body.length);
    };
    validate(schemaName)(req, res, next);
  });
};

const testValidateOk = (schemaName: string, body: any) => {
  const req = httpMocks.createRequest();
  req.body = body;
  const res = httpMocks.createResponse();
  const next = (err: any) => {
    assert.equal(err, undefined);
  };
  validate(schemaName)(req, res, next);
};
