import './styles.scss';

import {
    Button,
    Dialog,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    DialogTrigger,
    Tab,
    TabList,
} from '@fluentui/react-components';
import {
    Call24Filled,
    Camera24Filled,
    Dismiss24Regular,
    Folder24Filled,
    Location24Filled,
    Mail24Filled,
    MicRecord24Filled,
    PeopleCommunity24Filled,
} from '@fluentui/react-icons';
import React, { useState } from 'react';

import { VictimOrder } from '../../../common/enums';
import { type VictimDeviceStore } from '../../store/VictimDeviceStore';

interface IProps {
    data?: VictimDeviceStore;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const VictimDeviceModal: React.FC<IProps> = (props) => {
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
                        <TabList
                            size='large'
                            selectedValue={selectedTab}
                            onTabSelect={(_, data) => {
                                setSelectedTab(data.value as VictimOrder);
                            }}
                        >
                            <Tab
                                value={VictimOrder.CAMERA}
                                icon={<Camera24Filled />}
                            >
                                Camera
                            </Tab>
                            <Tab
                                value={VictimOrder.FILE_MANAGER}
                                icon={<Folder24Filled />}
                            >
                                Files
                            </Tab>
                            <Tab
                                value={VictimOrder.MICROPHONE}
                                icon={<MicRecord24Filled />}
                            >
                                Microphone
                            </Tab>
                            <Tab
                                value={VictimOrder.LOCATION}
                                icon={<Location24Filled />}
                            >
                                Location
                            </Tab>
                            <Tab
                                value={VictimOrder.CONTACTS}
                                icon={<PeopleCommunity24Filled />}
                            >
                                Contacts
                            </Tab>
                            <Tab
                                value={VictimOrder.SMS}
                                icon={<Mail24Filled />}
                            >
                                SMS
                            </Tab>
                            <Tab
                                value={VictimOrder.CALLS}
                                icon={<Call24Filled />}
                            >
                                Calls
                            </Tab>
                        </TabList>
                    </DialogTitle>
                    <DialogContent></DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
