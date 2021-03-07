import { Request, Response } from '../libs/Models'
import JwksClient, { SigningKey } from 'jwks-rsa';
import { User } from '../libs/Models';
import config from '../config';
import jwt, { JwtHeader, VerifyErrors } from 'jsonwebtoken'

const client = JwksClient({
  strictSsl: config.sso.startsWith('https'),
  jwksUri: config.sso + '/.well-known/jwks.json'
});
const algorithm = 'RS512';

function getKey (next: CallableFunction) {
  return (header: JwtHeader, callback: CallableFunction) => {
    client.getSigningKey(String(header.kid), function (err: Error | null, key: SigningKey): void {
      if (key) {
        callback(err, key.getPublicKey());
      } else {
        next(err);
      }
    });
  };
}

export const jwtVerifyMiddleware = (
  req: Request,
  res: Response,
  next: CallableFunction
) => {
  //TODO find better way to handle this stuff
  if (req.url.indexOf('/api-docs') === 0
    || (req.method == 'PATCH' && req.url.indexOf('/activate') === 0)
    || (req.method == 'POST' && req.url === '/')) {
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
          { algorithms: [algorithm] },
          (err: VerifyErrors | null, decoded: object | undefined) => {
            if (err) {
              return next(err);
            }
            req.user = <User>decoded;
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
