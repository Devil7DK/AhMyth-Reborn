import { strip } from '@colors/colors';
import { highlight } from 'cli-highlight';
import dayjs from 'dayjs';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { config } from './config';

const formatError = format((info) => {
    if (Object.prototype.hasOwnProperty.call(info, 'error')) {
        info.error =
            info.error instanceof Error ? info.error.stack : info.error;
    }
    return info;
});

const getStringifiedObject = (object: Record<string, unknown>): string => {
    try {
        return JSON.stringify(object);
    } catch (error) {
        console.log(object);
        return '';
    }
};

export const logger = createLogger({
    level: config.LOG_LEVEL,
    format: format.combine(format.timestamp(), format.splat(), formatError()),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(
                    ({
                        level,
                        message,
                        timestamp,
                        label = 'server',
                        ...rest
                    }) => {
                        if (label === 'query')
                            message = highlight(message as string, {
                                language: 'sql',
                            });

                        return `${dayjs(timestamp as string).format(
                            'YYYY-MM-DD HH:mm:ss',
                        )}  [${new Array(7 - strip(level).length)
                            .fill(' ')
                            .join('')}${level}]  [${label}] : ${message} ${
                            Object.values(rest).length > 0
                                ? getStringifiedObject(rest)
                                : ''
                        }`;
                    },
                ),
            ),
        }),
        new DailyRotateFile({
            format: format.json(),
            filename: 'logs/%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '3d',
        }),
    ],
});
