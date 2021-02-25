import httpMocks from 'node-mocks-http'
import { assert } from 'chai'

import { connect } from '../../services/DBService';

import { usersReset, connectionsReset } from './AbstractIntegrationTest'
import * as RequestsController from '../../controllers/RequestsController'

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

  /*
getIncomingRequests
getOutgoingRequests
createRequests
acceptRequests
*/

})
