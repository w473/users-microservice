const winston = require('winston');
const config = require('../../config').default;
const os = require('os');
const WinstonGraylog2 = require('winston-graylog2');

const options = {
  name: 'Graylog',
  level: 'info',
  silent: false,
  handleExceptions: true,
  graylog: {
    servers: [
      { host: config.logging.graylog.host, port: config.logging.graylog.port }
    ],
    hostname: os.hostname(),
    facility: 'users',
    bufferSize: 1400
  },
  staticMeta: { env: config.env }
};

const logger = winston.createLogger({
  exitOnError: false,

  transports: [new WinstonGraylog2(options), new winston.transports.Console()]
});

logger.stream({ start: -1 }).on('log', function (log) {
  logger.info(log);
});

export const stream = {
  write: (message) => {
    logger.info(message);
  }
};
export const logger = logger;
