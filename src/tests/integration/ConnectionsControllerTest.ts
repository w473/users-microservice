import httpMocks from 'node-mocks-http'
import { assert } from 'chai'

import * as ConnectionsController from '../../controllers/ConnectionsController'
import db, { connect } from '../../services/DBService';
import { Type as ConnectionType } from '../../models/ConnectionModel'

import { aql } from 'arangojs';

const stubData = {
  users: [
    {
      _key: '393967e0-8de1-11e8-9eb6-529269fb1459',
      username: 'aaaaaaa',
      name: 'some',
      familyName: 'name',
      email: 'proper@emailexample.de',
      locale: 'de_DE',
      roles: ['USER'],
      isActive: true
    },
    {
      _key: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      username: 'username',
      name: 'bla bla',
      familyName: 'bla name',
      email: 'sssssss@emailexample.de',
      locale: 'pl_PL',
      roles: ['USER', 'ADMIN'],
      isActive: true
    },
    {
      _key: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      username: 'otherusername',
      name: 'some',
      familyName: 'name longer',
      email: 'eeefffee@emailexample.de',
      locale: 'en_US',
      roles: ['USER'],
      isActive: false
    }
  ],
  connections: [
    {
      _from: 'users/f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      _to: 'users/f10f7c9d-745d-4481-a86a-3dc67e186fed',
      type: ConnectionType.request,
      created: 1614113070000,
    },
    {
      _from: 'users/f10f7c9d-745d-4481-a86a-3dc67e186fed',
      _to: 'users/f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      type: ConnectionType.request,
      created: 1614113070000,
    },
    {
      _from: 'users/f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      _to: 'users/393967e0-8de1-11e8-9eb6-529269fb1459',
      type: ConnectionType.connection,
      created: 1614013070000,
    }
  ]
}

describe('Connections', () => {
  before(async () => {
    return connect();
  })
  beforeEach(async () => {
    let cursor = await db().query(aql`
        FOR user IN users
        RETURN user`
    );
    const users = await cursor.all();
    const usersCollection = db().collection('users')
    await usersCollection.removeAll(users);
    await usersCollection.saveAll(stubData.users);

    cursor = await db().query(aql`
        FOR connection IN connections
        RETURN connection`
    );
    const connections = await cursor.all();
    const connectionCollection = db().collection('connections')
    await connectionCollection.removeAll(connections);
    await connectionCollection.saveAll(stubData.connections);
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

  /*
getIncomingRequests
getOutgoingRequests
createRequests
acceptRequests
*/

})
