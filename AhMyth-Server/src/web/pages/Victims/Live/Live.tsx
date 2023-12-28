import './Live.scss';

import { InfoLabel, Switch } from '@fluentui/react-components';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
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
import {
    ConnectionStatusColorMap,
    ConnectionStatusTextMap,
} from '../../../utils/Mappings';

export const Live: React.FC = observer(() => {
    const { socketStore } = useStore();

    const openedVictim = socketStore.victims.find((v) => v.open);

    useEffect(() => {
        socketStore.connect();

        return () => {
            socketStore.disconnect();
        };
    }, [socketStore]);

    return (
        <>
            <div className='page-container live'>
                <CustomToolbar>
                    <Switch
                        label='Listen for victims'
                        labelPosition='before'
                        disabled={socketStore.inprogress}
                        checked={socketStore.listening}
                        onChange={(_, data) => {
                            if (data.checked) {
                                socketStore.startListening();
                            } else {
                                socketStore.stopListening();
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
                            Connected Victims: {socketStore.victims.length}
                        </InfoLabel>
                    </div>

                    <div className='item'>
                        <FontAwesomeIcon
                            icon={faTowerBroadcast}
                            color={
                                ConnectionStatusColorMap[
                                    socketStore.connectionStatus
                                ]
                            }
                        />
                        <InfoLabel
                            info={
                                'This indicates the status of connection between this window and the server. This is not related to the connection of the victims.'
                            }
                        >
                            Live Connection:{' '}
                            {
                                ConnectionStatusTextMap[
                                    socketStore.connectionStatus
                                ]
                            }
                        </InfoLabel>
                    </div>
                </CustomToolbar>
                <div className='table-container'>
                    {socketStore.victims.length > 0 ? (
                        <div className='grid-container'>
                            {socketStore.victims.map((victim) => (
                                <VictimCard
                                    key={`victim-${victim.id}`}
                                    data={victim}
                                    onClick={() => {
                                        socketStore.victims.forEach((v) => {
                                            v.setOpen(v.id === victim.id);
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='no-data'>
                            <div className='text'>
                                {!socketStore.listening
                                    ? 'Not listening for victims!'
                                    : 'No victims connected!'}
                            </div>
                        </div>
                    )}
                    <LoadingOverlay
                        loading={socketStore.loading || socketStore.inprogress}
                    />
                </div>
            </div>
            <VictimDeviceModal
                data={openedVictim}
                open={openedVictim !== undefined}
                setOpen={(open) => {
                    if (openedVictim !== undefined) {
                        socketStore.victims.forEach((v) => {
                            v.setOpen(v.id === openedVictim.id && open);
                        });
                    }
                }}
            />
        </>
    );
});
