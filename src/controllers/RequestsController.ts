import { Request, Response, Fault } from '../libs/Models'
import { Type as ConnectionType } from '../models/ConnectionModel';
import ConnectionsRepository from '../repositories/ConnectionsRepository';
import { formatAll } from '../formatters/ConnectionFormatter';
import UsersRepository from '../repositories/UsersRepository';

export const getIncomingRequests = async (req: Request, res: Response, next: CallableFunction) => {
    const usersId = req.user.id
    return ConnectionsRepository
        .findAllByUsersIdTo(
            usersId,
            Number(req.query.limit ?? 10),
            Number(req.query.offset ?? 0),
            ConnectionType.request
        )
        .then(connections => {
            return res.status(200).json({ connections: formatAll(connections) });
        })
        .catch(err => {
            return next(err);
        })
}

export const getOutgoingRequests = async (req: Request, res: Response, next: CallableFunction) => {
    const usersId = req.user.id
    return ConnectionsRepository
        .findAllByUsersIdFrom(
            usersId,
            Number(req.query.limit ?? 10),
            Number(req.query.offset ?? 0),
            ConnectionType.request
        )
        .then(connections => {
            return res.status(200).json({ connections: formatAll(connections) });
        })
        .catch(err => {
            return next(err);
        })
}

export const createRequests = async (req: Request, res: Response, next: CallableFunction) => {
    const usersId = req.user.id
    const friendId = req.params.usersId;

    if (!await UsersRepository.exists(friendId)) {
        return res.status(400).json({ message: 'User does not exists' });
    }

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
        if (err instanceof Fault) {
            return res.status(400).json({ message: err.message });
        }
        return next(err)
    }
}

export const acceptRequests = async (req: Request, res: Response, next: CallableFunction) => {
    const usersId = req.user.id
    const friendId = req.params.usersId;

    try {
        const connection = await ConnectionsRepository.findConnection(friendId, usersId);
        if (!connection) {
            return res.status(404).json({ message: 'Connection request has not been found' });
        }
        if (connection.getType() == ConnectionType.connection) {
            return res.status(400).json({ message: 'Connection is already accepted' });
        }
        await ConnectionsRepository.acceptConnection(connection);
        return res.status(204).send();
    } catch (err) {
        if (err instanceof Fault) {
            return res.status(400).json({ message: err.message });
        }
        return next(err);
    }
}