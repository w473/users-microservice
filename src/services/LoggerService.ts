
import winston from 'winston'
import config from '../config'
import os from 'os'
import { WinstonGraylog } from '@pskzcompany/winston-graylog'

const logger = winston.createLogger({
    exitOnError: false,
    transports: [
        new WinstonGraylog({
            level: 'info',
            handleExceptions: true,
            silent: false,
            graylog: config.logging.graylog,
            defaultMeta: {
                environment: config.env,
                hostname: os.hostname(),
                facility: 'users',
            },
        }),
        new winston.transports.Console()
    ],
});


logger.stream({ start: -1 }).on('log', function (log) {
    logger.info(log)
})

const stream = {
    write: (message: any) => {
        logger.info(message)
    }
}

export { stream, logger }
