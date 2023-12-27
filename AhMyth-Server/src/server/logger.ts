import { strip } from '@colors/colors';
import dayjs from 'dayjs';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { config } from './config';

export const logger = createLogger({
    level: config.LOG_LEVEL,
    format: format.combine(format.timestamp(), format.splat()),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(
                    ({ level, message, timestamp, label = 'server' }) => {
                        return `${dayjs(timestamp as string).format(
                            'YYYY-MM-DD HH:mm:ss',
                        )}  [${new Array(7 - strip(level).length)
                            .fill(' ')
                            .join('')}${level}]  [${label}] : ${message}`;
                    },
                ),
            ),
        }),
        new DailyRotateFile({
            filename: 'logs/%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '3d',
        }),
    ],
});
