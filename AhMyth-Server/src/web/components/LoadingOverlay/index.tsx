import './styles.scss';

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

interface IProps {
    loading?: boolean;
}

export const LoadingOverlay: React.FC<IProps> = (props) => {
    const [loading, setLoading] = useState(props.loading);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (props.loading === true) {
            setLoading(true);
            setOpacity(1);
        } else {
            setOpacity(0);

            const handle = setTimeout(() => {
                setLoading(false);
            }, 500);

            return () => {
                clearTimeout(handle);
            };
        }
    }, [props.loading]);

    return (
        <div
            className='custom-loading-overlay'
            style={{ opacity, display: loading === true ? 'flex' : 'none' }}
        >
            <div className='custom-loader'>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
};

LoadingOverlay.propTypes = {
    loading: PropTypes.bool,
};
