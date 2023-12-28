import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

export const config = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'production'],
        default: 'development',
        desc: 'The environment to run the server in.',
    }),
    HTTP_PORT: num({
        default: 80,
        devDefault: 3000,
        desc: 'The port to run server without HTTPS.',
    }),
    HTTPS_PORT: num({
        default: 443,
        devDefault: 3001,
        desc: 'The port to run server with HTTPS. Only used when HTTPS_KEY and HTTPS_CERT are set.',
    }),
    HTTPS_KEY: str({
        default: '',
        desc: 'The path to the HTTPS key.',
    }),
    HTTPS_CERT: str({
        default: '',
        desc: 'The path to the HTTPS certificate.',
    }),
    LOG_LEVEL: str({
        default: 'info',
        devDefault: 'verbose',
        desc: 'The log level to use.',
    }),
    AUTH_USERNAME: str({
        default: 'admin',
        desc: 'The username to use for authentication.',
    }),
    AUTH_PASSWORD: str({
        devDefault: 'admin',
        desc: 'The password to use for authentication.',
    }),
    SQLITE_FILE: str({
        default: 'database.sqlite',
        desc: 'The path to the SQLite database file.',
    }),
    SOCKET_PORT: num({
        default: 42474,
        desc: 'The port to run the socket server on.',
    }),
    SOCKET_MAX_HTTP_BUFFER_SIZE: str({
        default: '100mb',
        desc: 'The maximum size of the HTTP buffer.',
        example: '100mb, 1gb, 2kb, 3b',
    }),
    SOCKET_PING_INTERVAL: str({
        default: '10s',
        desc: 'How often to ping the clients.',
        example: '10s, 1m, 2h',
    }),
    SOCKET_PING_TIMEOUT: str({
        default: '10s',
        desc: 'How long to wait for a ping response.',
        example: '10s, 1m, 2h',
    }),
});
