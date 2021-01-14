const service = require('../../services/authorizationService');
const httpMocks = require('node-mocks-http');
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const token = 'eyJhbGciOiJSUzUxMiIsImtpZCI6IjQifQ.eyJlbWFpbCI6ImphY2VrQG1haW' +
    'wuY29tIiwiZXhwIjoxNjEwMzA5MjY4LjkzMTgyNDQsImlkIjoiNTEzMDM3MWUtZWFiOS00N' +
    '2E5LWEwMjgtNGRhMGM4MjIxYzk2IiwiaXNBY3RpdmUiOnRydWUsImxvY2FsZSI6InBsX1BM' +
    'IiwibG9uZ05hbWUiOiJqYWNlayBwbGFjZWsiLCJyZWZyZXNoVG9rZW4iOiJkYWNkYjM0OS0' +
    '1NDg3LTRkNzAtYWZmMi0wOGM0N2E3ZWExOGEiLCJyb2xlcyI6WyJVU0VSIl0sInVzZXJuYW' +
    '1lIjoiamFjZWsxMjExIn0.ehZ5l7jJFflt7IaR4NaJEylf5OuOjohBdI8s3MIlwvHoJZJ1mc' +
    '-HoNy4_KG5k4nBztgHHJyu5ye3gNPZJmEJLtiEP7zz3JyR4oka8WmynCab-0U-kN02J8YC8I' +
    'yX7oZgSLYiuFx3mK-nsMHfl_Kb-sCgi7HnRJuASVlTQwxSOOK7nTIEyE1cIAA0uqDNEVv2lX' +
    'iLXTKqfC7rHbQWhh_c5V1W5tzfB0nPmyvx-IGjK10gELePD4n-tlcKjKtO5aavt7k8gXqrN' +
    '_6KOPjhUgWriMvzexAquvGaNfYFIQCFWWgAmbYUMHyqdDHl9r8Ka1Zw97doUGJO-nK6ltPwl' +
    'B9i-Bs6BW7O0LvNBwZy7Ghqu1tCEDlgGgU25iVvqK_Jg1ZzJw4DpxW6saKlBp-dNoQ_yqnzXn' +
    'CseyfIIZiRyVax516Rd0JgNaqr4d8BTk0HfeTmMtxtgvMDEQwt_Amk23Ddvv2rhjMwUZQJ0gOE' +
    'BtEIC3aWxyT5SGgBIR4aTH-fi4JZAxENDNaXT5OUZ0Qs5bBQtmHDmzKfJF2eBGviMvb5sZ0dNt' +
    '4YZqVgcGdzGM4UbZMGJ5iQ8hkkAphTabtMfcFk7dpb5gFXG52CXy3CdImEy4FrKDjTedize-Tz' +
    'F6tuM28IwN03QnIWyyPBjo_Mjc6wfGa8dJ62w9DTHUgoIaLwZsw';

it('jwtVerifyMiddleware ok', function () {

    const req = httpMocks.createRequest({
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const res = httpMocks.createResponse();

    const verify = sinon.fake();

    sinon.replace(jwt, 'verify', verify);

    service.jwtVerifyMiddleware(req, res, {});

    expect(verify.called).to.be.true;

    sinon.restore();
});

it('jwtVerifyMiddleware no token', function () {

    const req = httpMocks.createRequest({
        headers: {
            'Authorization': 'Bearer '
        }
    });
    const res = httpMocks.createResponse();

    service.jwtVerifyMiddleware(req, res, {});
    expect(res.statusCode).equals(403);
});

it('jwtVerifyMiddleware no header', function () {

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    service.jwtVerifyMiddleware(req, res, {});
    expect(res.statusCode).equals(403);
});

it('hasRole error', function () {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['AA']
    };
    const res = httpMocks.createResponse();

    service.hasRole('USER')(req, res, {});
    expect(res.statusCode).equals(403);
});

it('hasRole error array', function () {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['AA']
    };
    const res = httpMocks.createResponse();

    service.hasRole(['USER', 'ADMIN'])(req, res, {});
    expect(res.statusCode).equals(403);
});

it('hasRole ok', function (done) {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['USER']
    };
    const res = httpMocks.createResponse();

    const next = () => {
        done();
    }
    service.hasRole('USER')(req, res, next);
    expect(res.statusCode).equals(200);
});

it('hasRole ok array', function (done) {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['USER']
    };
    const res = httpMocks.createResponse();

    const next = () => {
        done();
    }
    service.hasRole(['USER', 'ADMIN'])(req, res, next);
    expect(res.statusCode).equals(200);
});

it('isAdmin OK', function (done) {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['ADMIN']
    };
    const res = httpMocks.createResponse();

    const next = () => {
        done();
    }
    service.isAdmin()(req, res, next);
    expect(res.statusCode).equals(200);
});

it('isAdmin err', function () {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['USER']
    };
    const res = httpMocks.createResponse();

    service.isAdmin()(req, res, {});
    expect(res.statusCode).equals(403);
});

it('isSystem OK', function (done) {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['SYS']
    };
    const res = httpMocks.createResponse();

    const next = () => {
        done();
    }
    service.isSystem()(req, res, next);
    expect(res.statusCode).equals(200);
});

it('isSystem err', function () {

    const req = httpMocks.createRequest();
    req.user = {
        'roles': ['AS']
    };
    const res = httpMocks.createResponse();

    service.isSystem()(req, res, {});
    expect(res.statusCode).equals(403);
});