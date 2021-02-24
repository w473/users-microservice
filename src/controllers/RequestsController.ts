import { Request, Response } from '../libs/Models'
import { Type as ConnectionType } from '../models/ConnectionModel';
import ConnectionsRepository from '../repositories/ConnectionsRepository';
import { findOne as findOneConnection } from '../repositories/FriendRepository';
import UsersRepository from '../repositories/UsersRepository';

//get requests both ways

export const createRequests = async (req: Request, res: Response, next: CallableFunction) => {
    const usersId = req.user.id
    const friendId = req.params.userId;

    if (usersId === friendId) {
        return res.status(400).json({ message: 'Connection can\'t be created' });
    }
    try {
        if ((await ConnectionsRepository.findKeysByUsersIds(usersId, friendId)).length > 0) {
            return res.status(400).json({ message: 'Connection already created' });
        }

        await ConnectionsRepository.createConnection(usersId, friendId);

        return res.status(204).send()
    } catch (err) {
        return next(err)
    }
}

export const acceptRequests = async (req: Request, res: Response, next: CallableFunction) => {
    const userId = req.user.id
    const friendId = req.params.userId;

    try {
        const connection = await ConnectionsRepository.findConnection(friendId, userId);
        if (!connection) {
            return res.status(404).json({ message: 'Connection request has not been found' });
        }
        if (connection.getType() == ConnectionType.connection) {
            return res.status(400).json({ message: 'Connection is already accepted' });
        }
        await ConnectionsRepository.acceptConnection(connection);
        return res.status(204).send();
    } catch (err) {
        return next(err);
    }
}