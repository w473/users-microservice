import express from 'express';
import morgan from 'morgan';
import stringify from 'json-stringify-safe';
import { ValidationError } from 'express-json-validator-middleware';
import { Request, Response } from './libs/Models'
import routes from './routes/Routes';
import { logger, stream } from './services/LoggerService';
import { dbObject } from './services/DBService';
import config from '../config';

const app = express();

app.use(morgan('combined', { stream: stream }));

app.use(express.json());

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(routes);

app.use((_, res: Response) => {
  if (!res.headersSent) {
    res
      .status(404)
      .json({ message: 'Page you are looking for does not exist' });
  }
});

app.use((error: Error | ValidationError, _1: Request, res: Response, _2: CallableFunction) => {
  if (error instanceof ValidationError) {
    logger.info(stringify(error));
    return res
      .status(400)
      .json({ message: 'Validation error', data: error.validationErrors });
  }
  logger.error(stringify(error));
  console.log(error);
  if (!res.headersSent) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token Expired' });
    }
    res.status(500).json({ message: 'Unexpected error occured' });
  }
  return null;
});

dbObject.connect()
  .then((_) => {
    app.listen(config.port);
  })
  .catch((err) => {
    logger.error(JSON.stringify(err));
    console.log('ERROR 1', err);
  });
