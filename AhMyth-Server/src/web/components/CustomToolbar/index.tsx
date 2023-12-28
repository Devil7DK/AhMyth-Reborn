import './styles.scss';

import PropTypes from 'prop-types';
import React, { type PropsWithChildren } from 'react';

const ToolbarDivider: React.FC = () => {
    return <div className='custom-toolbar-divider' />;
};

export const CustomToolbar: React.FC<PropsWithChildren<unknown>> & {
    Divider: React.FC;
} = ({ children }) => {
    return <div className='custom-toolbar'>{children}</div>;
};

CustomToolbar.Divider = ToolbarDivider;

CustomToolbar.propTypes = {
    children: PropTypes.node.isRequired,
};
