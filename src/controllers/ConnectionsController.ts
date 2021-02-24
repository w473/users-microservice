import { Request, Response } from '../libs/Models'
import ConnectionsRepository from '../repositories/ConnectionsRepository';
import { formatAll } from '../formatters/ConnectionFormatter'

export const getConnections = (req: Request, res: Response, next: CallableFunction) => {
    return ConnectionsRepository
        .findAllByUsersIdFrom(
            req.user.id,
            Number(req.query.limit ?? 10),
            Number(req.query.offset ?? 0)
        )
        .then(result => {
            return res.status(200).json(
                { friends: formatAll(result) }
            );
        })
        .catch((err: Error) => next(err));
}

export const removeConnection = (req: Request, res: Response, next: CallableFunction) => {
    return ConnectionsRepository
        .removeConnection(req.user.id, req.params.userId)
        .then((result) => {
            console.log(result);
            // if (deletedCount > 0) {
            //     return res.status(204).send();
            // }
            return res.status(404).json({ message: 'Connection has not been found' });
        })
        .catch((err: Error) => next(err))
}