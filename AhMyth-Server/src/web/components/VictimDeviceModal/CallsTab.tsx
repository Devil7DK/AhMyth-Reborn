import { Button, Label } from '@fluentui/react-components';
import {
    ArrowDownload24Filled,
    NumberSymbol24Filled,
    Person24Filled,
    Timer24Filled,
} from '@fluentui/react-icons';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import humanizeDuration from 'humanize-duration';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import {
    AndroidCallTypeIconMap,
    AndroidCallTypeTextMap,
} from '../../utils/Mappings';
import { type ITabProps } from '.';

export const CallsTab: React.FC<ITabProps> = observer((props) => {
    useEffect(() => {
        props.data.fetchCallLogs();
    }, []);

    return (
        <div className='custom-tab-content calls'>
            {props.data.callLogs.length > 0 ? (
                <>
                    <div className='call-controls'>
                        <Label>Total Calls: {props.data.callLogs.length}</Label>
                        <Button
                            appearance='primary'
                            disabled={props.data.callLogs.length === 0}
                            icon={<ArrowDownload24Filled />}
                            title='Download call logs as CSV'
                            onClick={() => {
                                if (props.data.callLogs.length > 0) {
                                    const csv = props.data.callLogs
                                        .map(
                                            (call) =>
                                                `"${call.name}","${call.phoneNo}","${call.type}","${call.duration}"`,
                                        )
                                        .join('\n');

                                    saveAs(
                                        new Blob([csv], {
                                            type: 'text/csv;charset=utf-8',
                                        }),
                                        `call-logs-${dayjs().format(
                                            'YYYYMMDDHHmmss',
                                        )}.csv`,
                                    );
                                }
                            }}
                        >
                            Download
                        </Button>
                    </div>
                    <div className='calls-list'>
                        {props.data.callLogs.map((call, index) => (
                            <div
                                key={`call-${index}`}
                                className='call-card'
                                title={`${call.name} (${call.phoneNo})`}
                            >
                                <div className='call-type'>
                                    <img
                                        title={
                                            AndroidCallTypeTextMap[call.type]
                                        }
                                        src={AndroidCallTypeIconMap[call.type]}
                                        alt={AndroidCallTypeTextMap[call.type]}
                                    />
                                    <span>
                                        {AndroidCallTypeTextMap[call.type]}
                                    </span>
                                </div>
                                <div className='call-info'>
                                    <div className='call-name'>
                                        <Person24Filled />
                                        <span>
                                            {typeof call.name === 'string' &&
                                            call.name !== ''
                                                ? call.name
                                                : 'Unknown Caller'}
                                        </span>
                                    </div>
                                    <div className='call-number'>
                                        <NumberSymbol24Filled />
                                        <span>{call.phoneNo}</span>
                                    </div>
                                    <div className='call-duration'>
                                        <Timer24Filled />
                                        <span>
                                            {humanizeDuration(
                                                Number(call.duration) * 1000,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className='no-data'>
                    <div className='text'>No call logs found!</div>
                </div>
            )}
        </div>
    );
});
