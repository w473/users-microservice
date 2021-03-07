import db, { dbService } from '../services/DBService'

db().then(() => dbService.ensureSystem())
