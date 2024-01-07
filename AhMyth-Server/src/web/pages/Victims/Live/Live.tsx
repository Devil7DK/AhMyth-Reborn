import './Live.scss';

import { InfoLabel, Switch } from '@fluentui/react-components';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import {
    CustomToolbar,
    LoadingOverlay,
    VictimCard,
    VictimDeviceModal,
} from '../../../components';
import { useStore } from '../../../store';

export const Live: React.FC = observer(() => {
    const { victimsSocketStore } = useStore();

    const openedVictim = victimsSocketStore.victims.find((v) => v.open);

    useEffect(() => {
        victimsSocketStore.connect();

        return () => {
            victimsSocketStore.disconnect();
        };
    }, [victimsSocketStore]);

    return (
        <>
            <div className='page-container live'>
                <CustomToolbar>
                    <Switch
                        label='Listen for victims'
                        labelPosition='before'
                        disabled={victimsSocketStore.inprogress}
                        checked={victimsSocketStore.listening}
                        onChange={(_, data) => {
                            if (data.checked) {
                                victimsSocketStore.startListening();
                            } else {
                                victimsSocketStore.stopListening();
                            }
                        }}
                    />
                    <div className='fill'></div>
                    <div className='item'>
                        <FontAwesomeIcon icon={faEye} />
                        <InfoLabel
                            info='This indicates the number of victims that are currently connected to the server.'
                            className='victims-count'
                        >
                            Connected Victims:{' '}
                            {victimsSocketStore.victims.length}
                        </InfoLabel>
                    </div>
                    <CustomToolbar.ConnectionStatus
                        label='Live Connection'
                        info='This indicates the status of connection between this window and the server. This is not related to the connection of the victims.'
                        connectionStatus={victimsSocketStore.connectionStatus}
                    />
                </CustomToolbar>
                <div className='table-container'>
                    {victimsSocketStore.victims.length > 0 ? (
                        <div className='grid-container'>
                            {victimsSocketStore.victims.map((victim) => (
                                <VictimCard
                                    key={`victim-${victim.id}`}
                                    data={victim}
                                    onClick={() => {
                                        victimsSocketStore.victims.forEach(
                                            (v) => {
                                                v.setOpen(v.id === victim.id);
                                            },
                                        );
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='no-data'>
                            <div className='text'>
                                {!victimsSocketStore.listening
                                    ? 'Not listening for victims!'
                                    : 'No victims connected!'}
                            </div>
                        </div>
                    )}
                    <LoadingOverlay
                        loading={
                            victimsSocketStore.loading ||
                            victimsSocketStore.inprogress
                        }
                    />
                </div>
            </div>
            <VictimDeviceModal
                data={openedVictim}
                open={openedVictim !== undefined}
                setOpen={(open) => {
                    if (openedVictim !== undefined) {
                        victimsSocketStore.victims.forEach((v) => {
                            v.setOpen(v.id === openedVictim.id && open);
                        });
                    }
                }}
            />
        </>
    );
});
