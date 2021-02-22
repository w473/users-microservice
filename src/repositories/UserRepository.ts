import { aql } from 'arangojs'
import { DocumentCollection } from 'arangojs/collection'
import { ObjectWithId } from 'arangojs/documents'
import User from '../models/UserModel'
import { db } from '../services/DBService'

class UserRepository {
  protected collection: DocumentCollection<any>

  constructor() {
    this.collection = db.collection('users')
  }
  public save = (user: User): Promise<any> => {
    return this.collection.save(user.serialize)
  }

  public async findOneByUserId(userId: string): Promise<User | null> {
    return this.findOne({ _key: userId })
  }

  public async findOne(where: any): Promise<User | null> {
    const filter = []
    for (const [key, value] of Object.entries(where)) {
      filter.push(`user._${key}=="${value}"`)
    }
    const cursor = await db.query(aql`
    FOR user IN users
    FILTER ${filter.join(' && ')}
    RETURN user`)
    const rawUser = await cursor.next()
    if (!rawUser) {
      return null
    }
    return this.hydrate(rawUser)
  }

  public async find(
    where: any,
    offset: number,
    count: number
  ): Promise<Array<User>> {
    let filter = []
    if (Array.isArray(where)) {
      filter = where
    } else {
      for (const [key, value] of Object.entries(where)) {
        filter.push(`user._${key}=="${value}"`)
      }
    }
    const cursor = await db.query(aql`
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

  public async delete(user: User): Promise<boolean> {
    const metadata = await this.collection.remove({
      _id: user.getDbId()
    } as ObjectWithId)
    if (metadata._key) {
      return true
    }
    return false
  }

  private hydrate(rawUser: any): User {
    const user = new User(
      rawUser.username,
      rawUser.name,
      rawUser.familyName,
      rawUser.email,
      rawUser.locale
    )
    user.bootExisting(rawUser._id, rawUser._rev, rawUser._key)
    user
      .getCredentials()
      .setActivationCode(rawUser.credentials.activationCode ?? null)
    user.getCredentials().setPassword(rawUser.credentials.password ?? null)
    return user
  }
}

export default new UserRepository()
