import { Request, Response } from '../libs/Models'
import { SigningKey, TokenHeader } from 'jwks-rsa';
import { User } from '../libs/Models';
import config from '../config';

const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const client = jwksClient({
  strictSsl: config.sso.startsWith('https'),
  jwksUri: config.sso + '/.well-known/jwks.json'
});
const algorithm = 'RS512';

function getKey (next: CallableFunction) {
  return (header: TokenHeader, callback: CallableFunction) => {
    client.getSigningKey(header.kid, function (err: Error, key: SigningKey) {
      if (key) {
        return callback(err, key.getPublicKey());
      }
      next(err);
    });
  };
}

export const jwtVerifyMiddleware = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  if (req.url.indexOf('/api-docs') === 0) {
    return next();
  }
  if (req.method === 'OPTIONS') {
    return next();
  }
  const authorizationHeader = req.header('Authorization');
  if (authorizationHeader) {
    const token = authorizationHeader.replace('Bearer ', '');
    if (token.length > 0) {
      try {
        return jwt.verify(
          token,
          getKey(next),
          { algorithm: algorithm },
          (err: Error, token: User) => {
            if (err) {
              return next(err);
            }
            req.user = token;
            next();
          }
        );
      } catch (error) {
        next(error);
      }
    }
  }
  return res.status(403).json({ message: `Not allowed - no token` });
};

export const hasRole = (role: string | Array<string>) => {
  return function (req: Request, res: Response, next: CallableFunction) {
    if (!Array.isArray(role)) {
      role = [role];
    }

    if (role.filter((r) => req.user.roles.lastIndexOf(r) !== -1).length === 0) {
      return res
        .status(403)
        .json({ message: `Not allowed - not enough privileges` });
    }
    return next();
  };
};

export const isAdmin = () => {
  return hasRole('ADMIN');
};

export const isSystem = () => {
  return hasRole('SYS');
};

export const isUser = () => {
  return hasRole('USER');
};
