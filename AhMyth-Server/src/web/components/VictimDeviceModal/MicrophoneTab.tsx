import { Button, Input, Label } from '@fluentui/react-components';
import {
    ArrowDownload24Filled,
    Record24Regular,
    TimePicker24Filled,
} from '@fluentui/react-icons';
import dayjs from 'dayjs';
import { saveAs } from 'file-saver';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { WaveAudioPlayer } from '../WaveAudioPlayer';
import { type ITabProps } from '.';

export const MicrophoneTab: React.FC<ITabProps> = observer((props) => {
    const [seconds, setSeconds] = useState(10);

    return (
        <div className='custom-tab-content microphone'>
            <div className='microphone-controls'>
                <Input
                    id='microphoneDuration'
                    contentBefore={<TimePicker24Filled />}
                    contentAfter={<Label>seconds</Label>}
                    type='number'
                    value={seconds.toString()}
                    min={10}
                    max={600}
                    onChange={(_, data) => {
                        setSeconds(
                            Math.min(600, Math.max(10, Number(data.value))),
                        );
                    }}
                />
                <Button
                    appearance='primary'
                    icon={<Record24Regular />}
                    onClick={() => {
                        props.data.recordAudio(seconds);
                    }}
                >
                    Record
                </Button>

                <Button
                    icon={<ArrowDownload24Filled />}
                    title='Download recorded audio'
                    disabled={props.data.audioDataUrl === null}
                    onClick={() => {
                        if (props.data.audioDataUrl !== null) {
                            saveAs(
                                props.data.audioDataUrl,
                                `record-${dayjs().format(
                                    'YYYYMMDDHHmmss',
                                )}.mp3`,
                            );
                        }
                    }}
                />
            </div>
            <div className='microphone-preview'>
                <WaveAudioPlayer audioUrl={props.data.audioDataUrl} />
            </div>
        </div>
    );
});
