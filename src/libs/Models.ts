import { Request, Response } from 'express';
declare module 'express-serve-static-core' {
    interface Request {
        user: User
    }
}
export interface User {
    id: string
    roles: Array<string>
}

export { Request, Response };

export abstract class Fault implements Error {
    name: string;
    message: string;
    stack?: string | undefined;

    constructor(message: string, stack: string | undefined = undefined) {
        this.name = this.constructor.name
        this.message = message
        this.stack = stack
    }
}

export class DBError extends Fault {
}