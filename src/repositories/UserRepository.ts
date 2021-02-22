import { DocumentCollection } from 'arangojs/collection';
import User from '../models/UserModel';
import { db } from '../services/DBService';

class UserRepository {
    protected collection: DocumentCollection<any>;

    constructor() {
        this.collection = db.collection('users');
    }
    save = (user: User): Promise<any> => {
        return this.collection.save(user.serialize);
    }
}

export default new UserRepository();