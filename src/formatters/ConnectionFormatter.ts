import Connection from '../models/ConnectionModel';

export const formatAll = function (connections: Array<Connection>): Array<object> {
    return connections.map(
        f => {
            return {
                friend: {
                    id: f.getUserTo()?.getDbId(),
                    name: f.getUserTo()?.getName(),
                    familyName: f.getUserTo()?.getFamilyName(),
                    use: f.getUserTo()?.getUsername()
                },
                created: f.created
            }
        }
    );
}