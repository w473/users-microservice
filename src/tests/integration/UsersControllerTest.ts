import httpMocks from 'node-mocks-http'
import { assert } from 'chai'

import { Database } from 'arangojs'
import User from '../../models/UserModel'
import * as UsersController from '../../controllers/UsersController'
import config from '../../../config'

const stubData = [
  {
    _id: MUUID.from('393967e0-8de1-11e8-9eb6-529269fb1459'),
    username: 'aaaaaaa',
    longName: 'some name',
    email: 'proper@emailexample.de',
    locale: 'de_DE',
    credentials: {
      password: 'some password'
    },
    roles: ['USER'],
    isActive: true
  },
  {
    _id: MUUID.from('f10f7c9d-745d-4481-a86a-3dc67e186fed'),
    username: 'username',
    longName: 'bla bla bla name',
    email: 'sssssss@emailexample.de',
    locale: 'pl_PL',
    credentials: {
      password: 'some password'
    },
    roles: ['USER', 'ADMIN'],
    isActive: true
  },
  {
    _id: MUUID.from('f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b'),
    username: 'otherusername',
    longName: 'some name longer',
    email: 'eeefffee@emailexample.de',
    locale: 'en_US',
    credentials: {
      password: '$2y$12$P/cqZ.mwU/7h43r0zbdWS.hCOb1KIt188p8.MR4Rm/a/v2cVloBOC',
      activationCode: 'c8307d28-e3a7-43c9-a4b4-3e0f0ec3d25c'
    },
    roles: ['USER'],
    isActive: false
  }
]
db = new Database(config.db.url)
describe('Users', () => {
  before(async () => {
    db.createDatabase(config.db.name)
      .then((result) => {
        app.listen(config.port)
      })
      .catch((err) => {
        logger.error(JSON.stringify(err))
        console.log('ERROR 1', err)
      })
  })

  beforeEach(async () => {
    return User.collection
      .deleteMany({})
      .then((result) => {
        return User.collection.insertMany(stubData)
      })
      .catch((err) => {
        console.log('ERROR 1', err)
      })
  })

  // after(async () => {
  //   return db.disconnect();
  // });

  it('2 users should be returned', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      limit: 10,
      offset: 0
    }
    const res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.find(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.message, 'Users found')
    assert.equal(json.data.length, 3)
  })

  it('findByEmail', async () => {
    const req = httpMocks.createRequest()
    req.body = {
      email: 'sssssss@emailexample.de'
    }
    const res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.findByEmail(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.message, 'User data found')

    assert.deepEqual(json.data, {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      username: 'username',
      longName: 'bla bla bla name',
      isActive: true,
      roles: ['USER', 'ADMIN'],
      locale: 'pl_PL',
      email: 'sssssss@emailexample.de'
    })
  })

  it('findByEmail 404', async () => {
    const req = httpMocks.createRequest()
    req.body = {
      email: 'sssssss@emailexaddmple.de'
    }
    const res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.findByEmail(req, res, next)
    assert.equal(res.statusCode, 404)
    const json = res._getJSONData()
    assert.equal(json.message, `User does not exists`)
  })

  it('findByEmailPassword 404', async () => {
    const req = httpMocks.createRequest()
    req.body = {
      email: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      password: 'passwrong'
    }
    const res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.findByEmailPassword(req, res, next)
    assert.equal(res.statusCode, 404)
    const json = res._getJSONData()
    assert.equal(json.message, 'User does not exists')
  })

  it('findByEmailPassword', async () => {
    const req = httpMocks.createRequest()
    req.body = {
      email: 'eeefffee@emailexample.de',
      password: 'pass'
    }
    const res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.findByEmailPassword(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.message, 'User data found')
    assert.deepEqual(json.data, {
      id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
      username: 'otherusername',
      longName: 'some name longer',
      isActive: false,
      roles: ['USER'],
      locale: 'en_US',
      email: 'eeefffee@emailexample.de'
    })
  })

  it('activate 404', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      activationCode: 'eeefffee@emailexample.de'
    }
    const res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.activate(req, res, next)
    assert.equal(res.statusCode, 404)
    const json = res._getJSONData()
    assert.equal(json.message, `User has not been found`)
  })

  it('activate', async () => {
    const req = httpMocks.createRequest()
    req.params = {
      activationCode: 'c8307d28-e3a7-43c9-a4b4-3e0f0ec3d25c'
    }
    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.activate(req, res, next)
    assert.equal(res.statusCode, 200)
    assert.equal(res._getJSONData().message, `User has been activated`)

    req.body = {
      email: 'eeefffee@emailexample.de'
    }
    res = httpMocks.createResponse()

    await UsersController.findByEmail(req, res, next)
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res._getJSONData(), {
      message: 'User data found',
      data: {
        id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
        username: 'otherusername',
        longName: 'some name longer',
        isActive: true,
        roles: ['USER'],
        locale: 'en_US',
        email: 'eeefffee@emailexample.de'
      }
    })
  })

  it('delete yourself', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: '393967e0-8de1-11e8-9eb6-529269fb1459'
    }
    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.delete(req, res, next)
    assert.equal(res.statusCode, 200)
    assert.equal(res._getJSONData().message, `User deleted`)
  })

  it('delete yourself with params', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: '393967e0-8de1-11e8-9eb6-529269fb1459'
    }
    req.params = {
      usersId: '393967e0-8de1-11e8-9eb6-529269fb1459'
    }
    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.delete(req, res, next)
    assert.equal(res.statusCode, 200)
    assert.equal(res._getJSONData().message, `User deleted`)
  })

  it('delete with params allowed', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER', 'ADMIN']
    }
    req.params = {
      usersId: '393967e0-8de1-11e8-9eb6-529269fb1459'
    }
    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.delete(req, res, next)
    assert.equal(res.statusCode, 200)
    assert.equal(res._getJSONData().message, `User deleted`)

    res = httpMocks.createResponse()
    await UsersController.get(req, res, next)

    assert.equal(res.statusCode, 404)
    assert.equal(res._getJSONData().message, `User does not exists`)
  })

  it('delete with params not allowed', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: '393967e0-8de1-11e8-9eb6-529269fb1459',
      roles: ['USER']
    }
    req.params = {
      usersId: 'f10f7c9d-745d-4481-a86a-3dc67e186fed'
    }
    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)
    await UsersController.delete(req, res, next)
    assert.equal(res.statusCode, 403)
    assert.equal(res._getJSONData().message, `Not Allowed`)
  })

  it('get yourself', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER', 'ADMIN']
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.get(req, res, next)

    assert.equal(res.statusCode, 200)
    assert.deepEqual(res._getJSONData(), {
      message: 'User data found',
      data: {
        id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
        username: 'username',
        longName: 'bla bla bla name',
        isActive: true,
        roles: ['USER', 'ADMIN'],
        locale: 'pl_PL',
        email: 'sssssss@emailexample.de'
      }
    })
  })

  it('get other admin', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER', 'ADMIN']
    }
    req.params = {
      usersId: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.get(req, res, next)

    assert.equal(res.statusCode, 200)
    assert.deepEqual(res._getJSONData(), {
      message: 'User data found',
      data: {
        id: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b',
        username: 'otherusername',
        longName: 'some name longer',
        isActive: false,
        roles: ['USER'],
        locale: 'en_US',
        email: 'eeefffee@emailexample.de'
      }
    })
  })

  it('get other', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER']
    }
    req.params = {
      usersId: 'f4a48cb8-4ee2-47d5-ab23-e6db0bf5d28b'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.get(req, res, next)

    assert.equal(res.statusCode, 403)
    assert.deepEqual(res._getJSONData(), { message: 'Not Allowed' })
  })

  it('edit change email', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER']
    }
    req.body = {
      email: 'newreal@fakeemail.de'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.edit(req, res, next)

    assert.equal(res.statusCode, 200)
    assert.deepEqual(res._getJSONData(), {
      message: 'Account needs to activated after email change'
    })
  })

  it('edit change password', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER']
    }
    req.body = {
      password: 'potato'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.edit(req, res, next)

    assert.equal(res.statusCode, 204)
  })

  it('edit change duplicated email', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER']
    }
    req.body = {
      email: 'proper@emailexample.de'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.edit(req, res, next)

    assert.equal(res.statusCode, 400)
    assert.deepEqual(res._getJSONData(), {
      message: 'Field "email" is not unique'
    })
  })

  it('edit change duplicated username', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER']
    }
    req.body = {
      username: 'otherusername'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.edit(req, res, next)

    assert.equal(res.statusCode, 400)
    assert.deepEqual(res._getJSONData(), {
      message: 'Field "username" is not unique'
    })
  })

  it('add', async () => {
    const req = httpMocks.createRequest()
    req.body = {
      longName: 'otherusername',
      username: 'otherusernamea',
      locale: 'pl_PL',
      credentials: {
        password: 'tomatoaa'
      },
      email: 'some@emailaa.de'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.add(req, res, next)

    assert.equal(res.statusCode, 200)
    assert.deepEqual(res._getJSONData(), {
      message: 'New user added successfuly'
    })

    res = httpMocks.createResponse()

    req.body = {
      email: 'some@emailaa.de'
    }
    res = httpMocks.createResponse()

    await UsersController.findByEmail(req, res, next)
    assert.equal(res.statusCode, 200)
    const json = res._getJSONData()
    assert.equal(json.message, 'User data found')
    assert.equal(json.data.username, 'otherusernamea')
    assert.equal(json.data.longName, 'otherusername')
    assert.equal(json.data.isActive, false)
    assert.deepEqual(json.data.roles, ['USER'])
    assert.equal(json.data.email, 'some@emailaa.de')
    assert.equal(json.data.locale, 'pl_PL')
  })

  it('add username not unique', async () => {
    const req = httpMocks.createRequest()
    req.body = {
      longName: 'otherusername',
      username: 'otherusername',
      locale: 'pl_PL',
      credentials: {
        password: 'tomatoaa'
      },
      email: 'some@emailaa.de'
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    res = httpMocks.createResponse()
    await UsersController.add(req, res, next)

    assert.equal(res.statusCode, 400)
    assert.deepEqual(res._getJSONData(), {
      message: 'Field "username" is not unique'
    })
  })

  it('setRoles', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER', 'ADMIN']
    }
    req.params.usersId = '393967e0-8de1-11e8-9eb6-529269fb1459'
    req.body = {
      roles: ['ADMIN', 'ADMIN', 'POTATO']
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    await UsersController.setRoles(req, res, next)

    assert.equal(res.statusCode, 204)

    res = httpMocks.createResponse()
    await UsersController.get(req, res, next)

    assert.equal(res.statusCode, 200)

    assert.deepEqual(res._getJSONData(), {
      message: 'User data found',
      data: {
        id: '393967e0-8de1-11e8-9eb6-529269fb1459',
        username: 'aaaaaaa',
        longName: 'some name',
        isActive: true,
        roles: ['ADMIN', 'POTATO', 'USER'],
        locale: 'de_DE',
        email: 'proper@emailexample.de'
      }
    })
  })

  it('setRoles SYS error', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER', 'ADMIN']
    }
    req.params.usersId = '393967e0-8de1-11e8-9eb6-529269fb1459'
    req.body = {
      roles: ['ADMIN', 'ADMIN', 'SYS']
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    await UsersController.setRoles(req, res, next)

    assert.equal(res.statusCode, 403)
    assert.equal(res._getJSONData().message, `Not Allowed`)
  })

  it('setRoles Same user error', async () => {
    const req = httpMocks.createRequest()
    req.user = {
      id: 'f10f7c9d-745d-4481-a86a-3dc67e186fed',
      roles: ['USER', 'ADMIN']
    }
    req.params.usersId = 'f10f7c9d-745d-4481-a86a-3dc67e186fed'
    req.body = {
      roles: ['ADMIN', 'ADMIN']
    }

    let res = httpMocks.createResponse()

    const next = (err) => console.log(err)

    await UsersController.setRoles(req, res, next)

    assert.equal(res.statusCode, 403)
    assert.equal(res._getJSONData().message, `Not Allowed`)
  })
})
