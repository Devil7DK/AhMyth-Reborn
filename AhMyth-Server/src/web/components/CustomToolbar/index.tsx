import './styles.scss';

import { InfoLabel } from '@fluentui/react-components';
import { faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { type PropsWithChildren } from 'react';

import { type ConnectionStatus } from '../../../common/enums';
import {
    ConnectionStatusColorMap,
    ConnectionStatusTextMap,
} from '../../utils/Mappings';

interface IToolbarConnectionStatusProps {
    label: string;
    info: string;
    connectionStatus: ConnectionStatus;
}

const ToolbarConnectionStatus: React.FC<IToolbarConnectionStatusProps> = (
    props,
) => {
    return (
        <div className='item'>
            <FontAwesomeIcon
                icon={faTowerBroadcast}
                color={ConnectionStatusColorMap[props.connectionStatus]}
            />
            <InfoLabel info={props.info}>
                {props.label}: {ConnectionStatusTextMap[props.connectionStatus]}
            </InfoLabel>
        </div>
    );
};

const ToolbarDivider: React.FC = () => {
    return <div className='custom-toolbar-divider' />;
};

export const CustomToolbar: React.FC<PropsWithChildren<unknown>> & {
    Divider: React.FC;
    ConnectionStatus: typeof ToolbarConnectionStatus;
} = ({ children }) => {
    return <div className='custom-toolbar'>{children}</div>;
};

CustomToolbar.ConnectionStatus = ToolbarConnectionStatus;
CustomToolbar.Divider = ToolbarDivider;

CustomToolbar.propTypes = {
    children: PropTypes.node.isRequired,
};
