import Edge from './EdgeModel';
import User from './UserModel';

class Connection extends Edge {
    private type!: Type;
    private created: Date;
    private userTo!: User | null;

    constructor(from: string, to: string, type: Type, created: Date, key: string | null = null) {
        super(from, to, key)
        this.type = type;
        this.created = created;
    }

    public serialize () {
        return Object.assign(super.serialize(), {
            type: this.type,
            created: this.created.getTime()
        })
    }

    public setUserTo (user: User | null): void {
        this.userTo = user;
    }

    public getUserTo (): User | null {
        return this.userTo;
    }

    public getType (): Type {
        return this.type;
    }

    public getCreated (): Date {
        return this.created;
    }
}

export enum Type {
    connection = 'connection',
    request = 'request'
}

export default Connection