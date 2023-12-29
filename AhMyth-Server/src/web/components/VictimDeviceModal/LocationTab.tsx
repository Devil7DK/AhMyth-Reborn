import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import { type ITabProps } from '.';

export const LocationTab: React.FC<ITabProps> = observer((props) => {
    useEffect(() => {
        props.data.fetchLocation();
    }, []);

    return (
        <div className='custom-tab-content location'>
            {props.data.location !== null ? (
                <MapContainer
                    center={props.data.location}
                    zoom={13}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                    <Marker position={props.data.location} />
                </MapContainer>
            ) : (
                <div className='no-data'>
                    <div className='text'>No location data available!</div>
                </div>
            )}
        </div>
    );
});
