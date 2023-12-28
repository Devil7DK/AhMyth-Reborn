import { ConnectionStatus } from '../../common/enums';

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
