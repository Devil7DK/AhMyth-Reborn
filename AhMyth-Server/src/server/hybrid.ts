import { app, BrowserWindow, screen as electronScreen } from 'electron';

import { config } from './config';
import { logger } from './logger';

/**
 * Create a electron window.
 */
export const createDesktopApp = (url: string): void => {
    try {
        if (!app) {
            logger.warn(
                'Electron app not supported on this platform. Skipping electron...',
                {
                    label: 'electron',
                    action: 'load',
                },
            );
            return;
        }

        const createMainWindow = (): void => {
            const mainWindow = new BrowserWindow({
                width: electronScreen.getPrimaryDisplay().workArea.width,
                height: electronScreen.getPrimaryDisplay().workArea.height,
                show: false,
                backgroundColor: 'white',
                webPreferences: {
                    nodeIntegration: false,
                },
            });

            mainWindow.setMenuBarVisibility(false);

            mainWindow
                .loadURL(url)
                .then(() => {
                    logger.info('Electron window loaded', {
                        label: 'electron',
                        action: 'load',
                    });
                })
                .catch((error) => {
                    logger.error('Electron window failed to load', {
                        label: 'electron',
                        action: 'load',
                        error,
                    });
                });

            mainWindow.once('ready-to-show', () => {
                logger.verbose('Electron window ready to show', {
                    label: 'electron',
                    action: 'ready',
                });
                mainWindow.show();
            });

            mainWindow.on('closed', () => {
                logger.info('Electron window closed', {
                    label: 'electron',
                    action: 'close',
                });
            });
        };

        app.whenReady()
            .then(() => {
                logger.verbose('Electron app ready', {
                    label: 'electron',
                    action: 'ready',
                });

                createMainWindow();

                app.on('activate', () => {
                    if (!BrowserWindow.getAllWindows().length) {
                        createMainWindow();
                    }
                });
            })
            .catch((error) => {
                logger.error('Electron failed to load', {
                    label: 'electron',
                    action: 'ready',
                    error,
                });
            });

        app.on('login', (event, webContents, request, authInfo, callback) => {
            event.preventDefault();
            callback(config.AUTH_USERNAME, config.AUTH_PASSWORD);
        });

        app.on('window-all-closed', () => {
            logger.verbose('All electron windows closed.', {
                label: 'electron',
                action: 'close',
            });

            if (process.platform !== 'darwin') {
                app.quit();
            }
        });
    } catch (error) {
        logger.error('Failed to create electron app!', {
            label: 'electron',
            action: 'load',
            error,
        });
    }
};
