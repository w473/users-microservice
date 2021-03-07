import httpMocks from 'node-mocks-http'
import { assert } from 'chai'

import { connect } from '../../src/services/DBService';

import { usersReset, connectionsReset } from './AbstractIntegrationTest'
import * as RequestsController from '../../src/controllers/RequestsController'
import ConnectionsRepository from '../../src/repositories/ConnectionsRepository';

describe('Requests', () => {
  before(async () => {
    return connect();
  })
  beforeEach(async () => {
    await usersReset()
    await connectionsReset()
  })

  it('No Incoming Requests', async () => {
    const req = httpMocks.createRequest()
    req.query = {
      limit: "10",
      offset: "0"
    }
    req.user = {
      id: '53132f53-25e0-4ee6-b579-172e2320887e',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.getIncomingRequests(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.connections.length, 0);
  })

  it('Incoming Requests', async () => {
    const req = httpMocks.createRequest()
    req.query = {
      limit: "10",
      offset: "0"
    }
    req.user = {
      id: 'b25491a7-2f80-47fb-b5c0-96fae87122f9',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.getIncomingRequests(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.connections.length, 1);
    assert.deepEqual(
      json,
      {
        'connections': [
          {
            connection: {
              id: 'users/393967e0-8de1-11e8-9eb6-529269fb1459',
              name: 'some',
              familyName: 'name',
              username: 'aaaaaaa'
            },
            created: 1614113070000
          }
        ]
      }

    );
  })

  it('No Outgoing Requests', async () => {
    const req = httpMocks.createRequest()
    req.query = {
      limit: "10",
      offset: "0"
    }
    req.user = {
      id: '53132f53-25e0-4ee6-b579-172e2320887e',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.getOutgoingRequests(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.connections.length, 0);
  })

  it('Outgoing Requests', async () => {
    const req = httpMocks.createRequest()
    req.query = {
      limit: "10",
      offset: "0"
    }
    req.user = {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.getOutgoingRequests(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.connections.length, 1);
    assert.deepEqual(
      json,
      {
        'connections': [
          {
            connection: {
              id: 'users/f10f7c9d-745d-4481-a86a-3dc67e186fed',
              name: 'bla bla',
              familyName: 'bla name',
              username: 'username'
            },
            created: 1614113070000
          }
        ]
      }
    );
  })

  it('createRequests not existing user', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "10"
    }
    req.user = {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.createRequests(req, res, next)
    assert.equal(res.statusCode, 400)
    assert.equal(res._getData(), '{"message":"User does not exists"}')
  })

  it('createRequests Connection can\'t be created', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b"
    }
    req.user = {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.createRequests(req, res, next)
    assert.equal(res.statusCode, 400)
    assert.equal(res._getData(), '{"message":"Connection can\'t be created"}')
  })

  it('createRequests Connection already created', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "f10f7c9d-745d-4481-a86a-3dc67e186fed"
    }
    req.user = {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.createRequests(req, res, next)
    assert.equal(res.statusCode, 400)
    assert.equal(res._getData(), '{"message":"Connection already created"}')
  })

  it('acceptRequests', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b"
    }
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: []
    }
    const res = httpMocks.createResponse()
    let request: any = await ConnectionsRepository.findConnection(req.params.usersId, req.user.id)
    assert.equal(request.type, 'request');
    assert.isNull(await ConnectionsRepository.findConnection(req.user.id, req.params.usersId))
    const next = (err: Error) => console.log(err)
    await RequestsController.acceptRequests(req, res, next)
    assert.equal(res.statusCode, 204)

    request = await ConnectionsRepository.findConnection(req.params.usersId, req.user.id)
    assert.equal(request.type, 'connection');

    const connection: any = await ConnectionsRepository.findConnection(req.user.id, req.params.usersId)
    assert.equal(connection.type, 'connection');
  })

  it('acceptRequests Wrong id', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "f4aasdasd0bf5d28b"
    }
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: []
    }
    const res = httpMocks.createResponse()

    const next = (err: Error) => console.log(err)
    await RequestsController.acceptRequests(req, res, next)
    assert.equal(res.statusCode, 404)
    assert.equal(res._getData(), '{"message":"Connection request has not been found"}')
  })
})
