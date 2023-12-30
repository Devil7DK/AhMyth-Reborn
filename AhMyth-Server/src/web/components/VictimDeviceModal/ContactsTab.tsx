import { Button, Label } from '@fluentui/react-components';
import { ArrowDownload24Filled } from '@fluentui/react-icons';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { type ITabProps } from '.';

export const ContactsTab: React.FC<ITabProps> = observer((props) => {
    useEffect(() => {
        props.data.fetchContacts();
    }, []);

    return (
        <div className='custom-tab-content contacts'>
            <div className='contact-controls'>
                <Label>Total Contacts: {props.data.contacts.length}</Label>
                <Button
                    appearance='primary'
                    disabled={props.data.contacts.length === 0}
                    icon={<ArrowDownload24Filled />}
                    title='Download contacts as CSV'
                    onClick={() => {
                        if (props.data.contacts.length > 0) {
                            const csv = props.data.contacts
                                .map(
                                    (contact) =>
                                        `"${contact.name}","${contact.phoneNo}"`,
                                )
                                .join('\n');

                            saveAs(
                                new Blob([csv], {
                                    type: 'text/csv;charset=utf-8',
                                }),
                                `contacts-${dayjs().format(
                                    'YYYYMMDDHHmmss',
                                )}.csv`,
                            );
                        }
                    }}
                >
                    Download
                </Button>
            </div>
            <div className='contacts-list'>
                {props.data.contacts.length > 0 ? (
                    props.data.contacts.map((contact, index) => (
                        <div key={`contact-${index}`} className='contact-card'>
                            <div className='contact-name' title={contact.name}>
                                {contact.name}
                            </div>
                            <div
                                className='contact-number'
                                title={contact.phoneNo}
                            >
                                {contact.phoneNo}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='no-data'>
                        <div className='text'>No contacts found</div>
                    </div>
                )}
            </div>
        </div>
    );
});
