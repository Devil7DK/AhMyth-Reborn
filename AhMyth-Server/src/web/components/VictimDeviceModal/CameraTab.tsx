import { Button, Combobox, Option } from '@fluentui/react-components';
import {
    ArrowDownload24Filled,
    CameraSparkles24Filled,
} from '@fluentui/react-icons';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';

import { type CameraItem } from '../../../common/interfaces';
import PlaceholderImage from '../../assets/images/placeholder-image.png';
import { type ITabProps } from '.';

export const CameraTab: React.FC<ITabProps> = observer((props) => {
    const [selectedCamera, setSelectedCamera] = useState<CameraItem>();

    useEffect(() => {
        props.data.listCameras();
    }, [props.data]);

    return (
        <div className='custom-tab-content camera'>
            {props.data.cameras.length > 0 ? (
                <>
                    <div className='camera-controls'>
                        <Combobox
                            selectedOptions={
                                selectedCamera === undefined
                                    ? []
                                    : [selectedCamera.id.toString()]
                            }
                            value={selectedCamera?.name ?? ''}
                            onOptionSelect={(_, data) => {
                                setSelectedCamera({
                                    id: Number(data.optionValue),
                                    name: data.optionText ?? '',
                                });
                            }}
                            placeholder='Select a camera'
                        >
                            {props.data.cameras.map((camera) => (
                                <Option
                                    key={camera.id}
                                    value={camera.id.toString()}
                                    text={camera.name}
                                >
                                    {camera.name}
                                </Option>
                            ))}
                        </Combobox>
                        <Button
                            icon={<CameraSparkles24Filled />}
                            disabled={selectedCamera === undefined}
                            onClick={() => {
                                if (selectedCamera !== undefined) {
                                    props.data.takePicture(selectedCamera.id);
                                }
                            }}
                        >
                            Capture
                        </Button>
                        <Button
                            disabled={props.data.imageDataUrl === null}
                            icon={<ArrowDownload24Filled />}
                            title='Download Captured Image'
                            onClick={() => {
                                if (props.data.imageDataUrl !== null) {
                                    saveAs(
                                        props.data.imageDataUrl,
                                        `${
                                            selectedCamera?.name ?? 'camera'
                                        }-${dayjs().format(
                                            'YYYYMMDDHHmmss',
                                        )}.jpg`,
                                    );
                                }
                            }}
                        />
                    </div>
                    <div className='camera-preview'>
                        <img
                            src={props.data.imageDataUrl ?? PlaceholderImage}
                            alt='camera-preview'
                        />
                    </div>
                </>
            ) : (
                <div className='no-cameras'>
                    <div className='text'>No cameras found</div>
                </div>
            )}
        </div>
    );
});
