import httpMocks from 'node-mocks-http'
import { assert } from 'chai'

import { connect } from '../../services/DBService';

import { usersReset, connectionsReset } from './AbstractIntegrationTest'
import * as ConnectionsController from '../../controllers/ConnectionsController'

describe('Connections', () => {
  before(async () => {
    return connect();
  })
  beforeEach(async () => {
    await usersReset()
    await connectionsReset()
  })

  it('No Connections', async () => {
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
    await ConnectionsController.getConnections(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.connections.length, 0);
  })

  it('One Connections', async () => {
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
    await ConnectionsController.getConnections(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.deepEqual(
      {
        'connections': [
          {
            connection: {
              id: 'users/393967e0-8de1-11e8-9eb6-529269fb1459',
              name: 'some',
              familyName: 'name',
              username: 'aaaaaaa'
            },
            created: 1614013070000
          }
        ],
      },
      json
    )
  })

  it('Remove One Connection', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "393967e0-8de1-11e8-9eb6-529269fb1459"
    }
    req.user = {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      roles: []
    }

    const next = (err: Error) => console.log(err)
    let res = httpMocks.createResponse()
    await ConnectionsController.removeConnection(req, res, next)
    assert.equal(res.statusCode, 204)

    res = httpMocks.createResponse()
    await ConnectionsController.getConnections(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.connections.length, 0)
  })

  it('Remove Not Existing Connection', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      usersId: "393967e0-d8de1-11e8-9eb6-529269fb1459"
    }
    req.user = {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      roles: []
    }

    const next = (err: Error) => console.log(err)
    let res = httpMocks.createResponse()
    await ConnectionsController.removeConnection(req, res, next)
    assert.equal(res.statusCode, 404)
    const json = res._getData()
    assert.equal('{"message":"Connection has not been found"}', json)
  })
})
