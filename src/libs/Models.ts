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