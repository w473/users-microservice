import Connection from '../models/ConnectionModel';

export const formatAll = function (connections: Array<Connection>): Array<object> {
    return connections.map(
        f => {
            return {
                connection: {
                    id: f.getUserTo()?.getDbId(),
                    name: f.getUserTo()?.getName(),
                    familyName: f.getUserTo()?.getFamilyName(),
                    username: f.getUserTo()?.getUsername()
                },
                created: f.getCreated().getTime()
            }
        }
    );
}