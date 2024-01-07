import './ListPayloads.scss';

import { InfoLabel } from '@fluentui/react-components';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { CustomToolbar, PayloadCard } from '../../../components';
import { useStore } from '../../../store';

export const ListPayloads: React.FC = observer(() => {
    const { payloadsSocketStore } = useStore();

    useEffect(() => {
        payloadsSocketStore.connect();

        return () => {
            payloadsSocketStore.disconnect();
        };
    }, [payloadsSocketStore]);

    return (
        <div className='page-container payloads'>
            <CustomToolbar>
                <div className='item'>
                    <FontAwesomeIcon icon={faEye} />
                    <InfoLabel
                        info='This indicates the number of victims that are currently connected to the server.'
                        className='victims-count'
                    >
                        Total Payloads: {payloadsSocketStore.payloads.length}
                    </InfoLabel>
                </div>
                <div className='fill'></div>
                <CustomToolbar.ConnectionStatus
                    label='Connection Status'
                    info='This indicates the status of connection between this window and the server.'
                    connectionStatus={payloadsSocketStore.connectionStatus}
                />
            </CustomToolbar>
            {payloadsSocketStore.payloads.length ? (
                <div className='payloads-list'>
                    {payloadsSocketStore.payloads.map((payload) => (
                        <PayloadCard key={payload.id} payload={payload} />
                    ))}
                </div>
            ) : (
                <div className='no-data'>
                    <div className='text'>No payloads found!</div>
                </div>
            )}
        </div>
    );
});
