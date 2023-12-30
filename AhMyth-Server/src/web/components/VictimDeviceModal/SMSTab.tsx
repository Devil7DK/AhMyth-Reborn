import {
    Avatar,
    Button,
    Field,
    Input,
    Label,
    Tab,
    TabList,
    Textarea,
} from '@fluentui/react-components';
import {
    ArrowDownload24Filled,
    BookNumber24Regular,
    MailInbox24Filled,
    Send24Filled,
} from '@fluentui/react-icons';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

import { type ITabProps } from '.';

enum SMSTabs {
    SEND = 'send',
    VIEW = 'view',
}

const SMSSend: React.FC<ITabProps> = observer((props) => {
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    return (
        <div className='custom-tab-content send-sms'>
            <Field label='Phone Number'>
                <Input
                    contentBefore={<BookNumber24Regular />}
                    type='text'
                    value={phoneNumber}
                    onChange={(_, data) => {
                        setPhoneNumber(data.value);
                    }}
                />
            </Field>
            <Field label='Message' className='message'>
                <Textarea
                    size='large'
                    value={message}
                    onChange={(_, data) => {
                        setMessage(data.value);
                    }}
                />
            </Field>

            <Button
                icon={<Send24Filled />}
                appearance='primary'
                onClick={() => {
                    props.data.sendSMS(phoneNumber, message);

                    setPhoneNumber('');
                    setMessage('');
                }}
            >
                Send
            </Button>
        </div>
    );
});

const SMSView: React.FC<ITabProps> = observer((props) => {
    useEffect(() => {
        props.data.fetchSMSMessages();
    }, []);

    return (
        <div className='custom-tab-content view-sms'>
            {props.data.smsMessages.length > 0 ? (
                <>
                    <div className='sms-controls'>
                        <Label>
                            Total Messages: {props.data.smsMessages.length}
                        </Label>
                        <Button
                            appearance='primary'
                            disabled={props.data.smsMessages.length === 0}
                            icon={<ArrowDownload24Filled />}
                            title='Download SMS Messages as CSV'
                            onClick={() => {
                                if (props.data.smsMessages.length > 0) {
                                    const csv = props.data.smsMessages
                                        .map(
                                            (sms) =>
                                                `"${sms.phoneNo}","${sms.msg}"`,
                                        )
                                        .join('\n');

                                    saveAs(
                                        new Blob([csv], {
                                            type: 'text/csv;charset=utf-8',
                                        }),
                                        `sms-${dayjs().format(
                                            'YYYYMMDDHHmmss',
                                        )}.csv`,
                                    );
                                }
                            }}
                        >
                            Download
                        </Button>
                    </div>
                    <div className='sms-messages'>
                        {props.data.smsMessages.map((sms, index) => (
                            <div className='sms-card' key={`sms-${index}`}>
                                <Avatar />
                                <div className='sms-content'>
                                    <div className='sender'>{sms.phoneNo}</div>
                                    <div className='message'>{sms.msg}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className='no-data'>
                    <div className='text'>No SMS messages available!</div>
                </div>
            )}
        </div>
    );
});

export const SMSTab: React.FC<ITabProps> = observer((props) => {
    const [selectedTab, setSelectedTab] = useState<SMSTabs>(SMSTabs.SEND);

    useEffect(() => {
        props.data.fetchSMSMessages();
    }, []);

    return (
        <div className='custom-tab-content sms'>
            <TabList
                selectedValue={selectedTab}
                onTabSelect={(_, data) => {
                    setSelectedTab(data.value as SMSTabs);
                }}
                size='large'
            >
                <Tab icon={<Send24Filled />} title='Send' value={SMSTabs.SEND}>
                    Send
                </Tab>
                <Tab
                    icon={<MailInbox24Filled />}
                    title='View'
                    value={SMSTabs.VIEW}
                >
                    View
                </Tab>
            </TabList>
            {
                {
                    [SMSTabs.SEND]: <SMSSend data={props.data} />,
                    [SMSTabs.VIEW]: <SMSView data={props.data} />,
                }[selectedTab]
            }
        </div>
    );
});
