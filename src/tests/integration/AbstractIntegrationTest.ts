
import { Type as ConnectionType } from '../../models/ConnectionModel'
import db from '../../services/DBService';
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
            credentials: {
                password: 'some password'
            },
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
            credentials: {
                password: 'some password'
            },
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
            credentials: {
                password: '$2y$12$P/cqZ.mwU/7h43r0zbdWS.hCOb1KIt188p8.MR4Rm/a/v2cVloBOC',
                activationCode: 'c8307d28-e3a7-43c9-a4b4-3e0f0ec3d25c'
            },
            roles: ['USER'],
            isActive: false
        },
        {
            _key: 'b25491a7-2f80-47fb-b5c0-96fae87122f9',
            username: 'kopytko',
            name: 'ddddd',
            familyName: 'fnamer',
            email: 'eeefffee@sssss.de',
            locale: 'en_US',
            credentials: {
                password: '$2y$12$P/cqZ.mwU/7h43r0zbdWS.hCOb1KIt188p8.MR4Rm/a/v2cVloBOC'
            },
            roles: ['USER'],
            isActive: true
        },
        {
            _key: '9a73fa8f-b84c-4925-906b-96012b0c4be1',
            username: 'random',
            name: 'asasdf',
            familyName: 'fnameasdasdr',
            email: 'eeefffee@sss.de',
            locale: 'en_US',
            credentials: {
                password: '$2y$12$P/cqZ.mwU/7h43r0zbdWS.hCOb1KIt188p8.MR4Rm/a/v2cVloBOC'
            },
            roles: ['USER'],
            isActive: true
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
            _from: 'users/393967e0-8de1-11e8-9eb6-529269fb1459',
            _to: 'users/b25491a7-2f80-47fb-b5c0-96fae87122f9',
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

export const usersReset = async () => {
    const cursor = await db().query(aql`
        FOR user IN users
        RETURN user`
    );
    const users = await cursor.all();
    const usersCollection = db().collection('users')
    await usersCollection.removeAll(users);
    await usersCollection.saveAll(stubData.users);
}

export const connectionsReset = async () => {
    const cursor = await db().query(aql`
        FOR connection IN connections
        RETURN connection`
    );
    const connections = await cursor.all();
    const connectionCollection = db().collection('connections')
    await connectionCollection.removeAll(connections);
    await connectionCollection.saveAll(stubData.connections);
}