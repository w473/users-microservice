import config from '../../config';
import { Database } from 'arangojs';

export const db = new Database(config.db.url);

