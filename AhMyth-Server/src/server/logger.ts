import { strip } from '@colors/colors';
import { highlight } from 'cli-highlight';
import dayjs from 'dayjs';
import { type Logger } from 'typeorm';
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
                        if (label === 'query' || label === 'query-slow')
                            message = highlight(message as string, {
                                language: 'sql',
                            });

                        return `${dayjs(timestamp as string).format(
                            'YYYY-MM-DD HH:mm:ss',
                        )}  [${new Array(7 - strip(level).length)
                            .fill(' ')
                            .join('')}${level}]  [${label}] : ${message} ${
                            Object.values(rest).length > 0
                                ? JSON.stringify(rest)
                                : ''
                        }`;
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

export class TypeORMLogger implements Logger {
    logQuery(query: string, parameters?: any[] | undefined): void {
        logger.debug(query, { label: 'typeorm', action: 'query', parameters });
    }

    logQueryError(
        error: string | Error,
        query: string,
        parameters?: any[] | undefined,
    ): void {
        logger.error(error instanceof Error ? error.message : error, {
            label: 'typeorm',
            action: 'query',
            query,
            parameters,
            error,
        });
    }

    logQuerySlow(
        time: number,
        query: string,
        parameters?: any[] | undefined,
    ): void {
        logger.debug(query, {
            label: 'typeorm',
            action: 'query-slow',
            parameters,
            time,
        });
    }

    logSchemaBuild(message: string): void {
        logger.debug(message, { label: 'typeorm', action: 'schema' });
    }

    logMigration(message: string): void {
        logger.debug(message, { label: 'typeorm', action: 'migration' });
    }

    log(level: 'info' | 'log' | 'warn', message: string): void {
        logger.log(level, message, { label: 'typeorm', action: 'log' });
    }
}
