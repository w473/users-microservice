import { aql } from 'arangojs'
import User from '../models/UserModel'
import Connection, { Type as ConnectionType } from '../models/ConnectionModel'
import UsersRepository from './UsersRepository'
import db from '../services/DBService'
import { EdgeCollection } from 'arangojs/collection'
import { GeneratedAqlQuery } from 'arangojs/aql'
import { DBError } from '../libs/Models'

class ConnectionsRepository {
    collection (): EdgeCollection {
        return db().collection('connections')
    }

    public async findAllByUsersIdFrom (
        usersId: string,
        count: number,
        offset: number,
        type: ConnectionType = ConnectionType.connection
    ): Promise<Array<Connection>> {
        const id = 'users/' + usersId;
        return this.findAllByAqlQuery(aql`
        FOR c IN connections
        FOR user IN users
        FILTER c._from==${id} && user._id==c._to && c.type==${type}
        SORT user.familyName, user.name DESC
        LIMIT ${offset}, ${count}
        RETURN {c,user}
        `)
    }

    public async findAllByUsersIdTo (
        usersId: string,
        count: number,
        offset: number,
        type: ConnectionType = ConnectionType.connection
    ): Promise<Array<Connection>> {
        const id = 'users/' + usersId;
        return this.findAllByAqlQuery(aql`
        FOR c IN connections
        FOR user IN users
        FILTER c._to==${id} && user._id==c._from && c.type==${type}
        SORT user.familyName, user.name DESC
        LIMIT ${offset}, ${count}
        RETURN {c,user}
        `);
    }

    private async findAllByAqlQuery (query: GeneratedAqlQuery): Promise<Array<Connection>> {
        const cursor = await db().query(query)
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
        usersIdFirst = 'users/' + usersIdFirst.replace('users/', '');
        usersIdSecond = 'users/' + usersIdSecond.replace('users/', '');
        this.collection().documentExists
        const connection = new Connection(
            usersIdFirst,
            usersIdSecond,
            connectionType,
            new Date()
        );
        return this.collection().save(connection.serialize())
            .catch(error => {
                if (error.name === 'ArangoError' && error.message === 'illegal document key') {
                    throw new DBError('Wrong Users Id')
                }
                throw error
            });
    }

    public async findConnection (usersIdFrom: string, usersIdTo: string): Promise<Connection | null> {
        usersIdFrom = 'users/' + usersIdFrom;
        usersIdTo = 'users/' + usersIdTo;
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
            rawData.type,
            new Date(rawData.created),
            rawData._key
        )
        connection.setUserTo(user);
        return connection
    }
}

export default new ConnectionsRepository()