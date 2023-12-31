import { ConnectionStatus } from '../../common/enums';
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
