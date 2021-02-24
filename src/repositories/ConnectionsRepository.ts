import { aql } from 'arangojs'
import User from '../models/UserModel'
import Connection, { Type as ConnectionType } from '../models/ConnectionModel'
import UsersRepository from './UsersRepository'
import db from '../services/DBService'
import { EdgeCollection } from 'arangojs/collection'

class ConnectionsRepository {
    collection (): EdgeCollection {
        return db().collection('connections')
    }

    public async findAllByUsersIdFrom (
        usersId: string,
        count: number,
        offset: number
    ): Promise<Array<Connection>> {

        const id = 'users/' + usersId;
        const cursor = await db().query(aql`
        FOR c IN connections
        FOR user IN users
        FILTER  c._from==${id} && user._id==c._to && c.type!='request'
        SORT user.familyName, user.name DESC
        LIMIT ${offset}, ${count}
        RETURN {c,user}
        `)
        const users = await cursor.all()
        const ret = new Array()

        users.forEach((rawData) => {
            const user = UsersRepository.hydrate(rawData.user);
            const connection = this.hydrate(rawData.c, user);
            ret.push(connection)
        })
        return ret
    }

    public async findKeysByUsersIds (usersIdFirst: string, usersIdSecond: string): Promise<Array<string>> {
        const fId = 'users/' + usersIdFirst;
        const sId = 'users/' + usersIdSecond;
        const cursor = await db().query(aql`
        FOR c IN connections
        FILTER  (c._from==${fId} && c._to==${sId}) || (c._to==${fId} && c._from==${sId})
        RETURN c._key
        `)
        return await cursor.all()
    }

    public async removeConnection (usersIdFirst: string, usersIdSecond: string): Promise<any> {
        const keys = await this.findKeysByUsersIds(usersIdFirst, usersIdSecond)
        return this.collection().removeAll(keys);
    }

    public async createConnection (
        usersIdFirst: string,
        usersIdSecond: string,
        connectionType: ConnectionType = ConnectionType.request
    ): Promise<any> {
        const connection = new Connection('users/' + usersIdFirst, 'users/' + usersIdSecond, connectionType, new Date());
        return this.collection().save(connection);
    }

    public async findConnection (usersIdFrom: string, usersIdTo: string): Promise<Connection | null> {
        const cursor = await db().query(aql`
        FOR c IN connections
        FILTER  c._from==${usersIdFrom} && c._to==${usersIdTo}
        RETURN c
        `)
        const connectionRaw = await cursor.next()
        return connectionRaw ? this.hydrate(connectionRaw) : null;
    }

    public async acceptConnection (connection: Connection): Promise<any> {
        return Promise.all(
            [
                this.createConnection(connection.getTo(), connection.getFrom(), ConnectionType.connection),
                this.collection().update({ _key: <string>connection.getKey() }, { type: ConnectionType.connection })
            ]
        )
    }

    public hydrate (rawData: any, user: User | null = null): Connection {

        const connection = new Connection(
            rawData._from,
            rawData._to,
            rawData._type,
            new Date(rawData._created),
            rawData._key
        )
        connection.setUserTo(user);
        return connection
    }
}

export default new ConnectionsRepository()