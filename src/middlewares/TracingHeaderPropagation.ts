import { Request, Response } from '../libs/Models'
import httpContext from 'express-http-context'
import { Headers } from 'node-fetch';

const headersAllowed = [
    'x-request-id',
    'x-b3-traceid',
    'x-b3-spanid',
    'x-b3-parentspanid',
    'x-b3-sampled',
    'x-b3-flags',
    'x-ot-span-context'
];

export const headerPropagator = (req: Request, res: Response, next: CallableFunction) => {
    const headersSaved = new Headers()

    headersAllowed.forEach(headerName => {
        const headerValue = req.header(headerName)
        if (headerValue) {
            headersSaved.set(headerName, headerValue)
            res.setHeader(headerName, headerValue)
        }
    });

    httpContext.set('headers', headersSaved)
    return next();
}

export const getHeaders = (): Headers => {
    return httpContext.get('headers')
}