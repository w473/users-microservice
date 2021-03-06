import config from '../config';
import { Database } from 'arangojs';

class DBService {
    private dbMain !: Database;
    private db !: Database;

    private collections = ['users', 'connections'];

    private async getDBMain (): Promise<Database> {
        //TO DO here should be as well reconnect code
        if (!this.dbMain) {
            this.dbMain = new Database(config.db.url);
            return this.dbMain.useBasicAuth(config.db.login, config.db.password)
        }
        return this.dbMain;
    }

    public async getDB (): Promise<Database> {
        //TO DO here should be as well reconnect code
        if (this.db) {
            return this.db;
        }
        if (!this.dbMain) {
            await this.getDBMain()
        }
        this.db = this.dbMain.database(config.db.name)
        return this.db
    }

    public async ensureSystem (): Promise<void> {
        const dbMain = await this.getDBMain();
        const dbs = await dbMain.listDatabases()
        if (!dbs.includes(config.db.name)) {
            this.db = await dbMain.createDatabase(config.db.name)
        }
        await this.ensureCollections()
    }

    private async ensureCollections (): Promise<void> {
        const db = await this.getDB()
        const existingCollections = await db.listCollections()
        const missingCollections = this.collections.filter(name => {
            return !(existingCollections.find(ec => ec.name === name))
        })
        for (const collection of missingCollections) {
            switch (collection) {
                case 'users':
                    await this.createUsersCollection();
                    break;
                case 'connections':
                    await this.createConnectionsCollection();
                    break;
            }
        }
    }

    private async createUsersCollection () {
        const db = await this.getDB();
        await db.createCollection('users');
        await db.collection('users').ensureIndex({ type: "persistent", fields: ["username"], unique: true });
        await db.collection('users').ensureIndex({ type: "persistent", fields: ["email"], unique: true });
    }

    private async createConnectionsCollection () {
        const db = await this.getDB();
        await db.createEdgeCollection('connections')
        await db.collection('connections').ensureIndex({ type: "persistent", fields: ["_from", "_to"], unique: true });
        await db.collection('connections').ensureIndex({ type: "persistent", fields: ["_to", "_from"], unique: true });
    }
}

export let dbService: DBService;
const getConnection = async (): Promise<Database> => {
    if (!dbService) {
        dbService = new DBService()
    }
    return await dbService.getDB();
}

export default getConnection;