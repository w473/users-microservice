import config from '../../config';
import { Database } from 'arangojs';

let _db: Database;
const collections = ['users', 'connections'];

export const connect = async (): Promise<Database> => {
    const db = new Database(config.db.url);
    db.useBasicAuth(config.db.login, config.db.password)
    _db = await ensureDB(db)
    ensureCollections(_db);
    return _db;
}

const ensureDB = async (_db: Database): Promise<Database> => {
    const dbs = await _db.listDatabases()
    if (!dbs.includes(config.db.name)) {
        return _db.createDatabase(config.db.name)
    }
    return _db.database(config.db.name)

}

const ensureCollections = async (_db: Database): Promise<void> => {
    const existingCollections = await _db.listCollections()
    const missingCollections = collections.filter(name => {
        return !(existingCollections.find(ec => ec.name === name))
    })
    for (const collection of missingCollections) {
        switch (collection) {
            case 'users':
                await createUsersCollection();
                break;
            case 'connections':
                await createConnectionsCollection();
                break;
        }
    }
}

const createUsersCollection = async () => {
    await _db.createCollection('users');
    await _db.collection('users').ensureIndex({ type: "persistent", fields: ["username"], unique: true });
    await _db.collection('users').ensureIndex({ type: "persistent", fields: ["email"], unique: true });
}

const createConnectionsCollection = async () => {
    await _db.createEdgeCollection('connections')
    await _db.collection('connections').ensureIndex({ type: "persistent", fields: ["_from", "_to"], unique: true });
    await _db.collection('connections').ensureIndex({ type: "persistent", fields: ["_to", "_from"], unique: true });
}

const db = (): Database => {
    return _db;
}

export default db;