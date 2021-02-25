import { aql } from 'arangojs'
import { ObjectWithId } from 'arangojs/documents'
import User from '../models/UserModel'
import db from '../services/DBService'

class UsersRepository {
  collection () {
    return db().collection('users')
  }

  public save = async (user: User): Promise<User> => {
    let res = null;
    if (user.getDbId()) {
      res = await this.collection().replace(<ObjectWithId>{ '_id': user.getDbId() }, user.serialize());
    } else {
      res = await this.collection().save(user.serialize())
    }
    return user.bootExisting(res._id, res._rev, res._key)
  }

  public async findOneByUserId (userId: string): Promise<User | null> {
    return this.findOne({ _key: userId })
  }

  public async findOne (where: any): Promise<User | null> {
    const filter = []
    for (const [key, value] of Object.entries(where)) {
      const field = `user.${key}`
      filter.push(aql.literal(`${field} ==`))
      filter.push(aql`${String(value)}`)
    }
    const tmp = aql`
    FOR user IN users
    FILTER ${aql.join(filter)}
    RETURN user`;
    const cursor = await db().query(tmp)
    const rawUser = await cursor.next()

    if (!rawUser) {
      return null
    }
    return this.hydrate(rawUser)
  }

  public async find (
    where: any,
    offset: number,
    count: number
  ): Promise<Array<User>> {
    let filter = []
    if (Array.isArray(where)) {
      filter = where
    } else {
      for (const [key, value] of Object.entries(where)) {
        filter.push(`user.${key}=="${value}"`)
      }
    }
    const cursor = await db().query(aql`
    FOR user IN users
    FILTER ${filter.join(' && ')}
    SORT user.familyName, user.name DESC
    LIMIT ${offset}, ${count}
    RETURN user`)
    const users = await cursor.all()
    const ret = new Array()

    users.forEach((rawUser) => {
      ret.push(this.hydrate(rawUser))
    })

    return ret
  }

  public async delete (user: User): Promise<boolean> {
    const metadata = await this.collection().remove({
      _id: user.getDbId()
    } as ObjectWithId)
    if (metadata._key) {
      return true
    }
    return false
  }

  public hydrate (rawUser: any): User {
    const user = new User(
      rawUser.username,
      rawUser.name,
      rawUser.familyName,
      rawUser.email,
      rawUser.locale
    )
    user.setRoles(rawUser.roles)
    user.bootExisting(rawUser._id, rawUser._rev, rawUser._key)
    user.setActivationCode(rawUser.credentials?.activationCode)
    user.getCredentials().setPassword(rawUser.credentials?.password)
    return user
  }
}

export default new UsersRepository()
