import './styles.scss';

import { observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { useStore } from '../../store';

interface IProps {
    loading?: boolean;
    type?: 'normal' | 'semi-transparent';
}

export const LoadingOverlay: React.FC<IProps> = observer((props) => {
    const { themeStore } = useStore();

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
            className={`custom-loading-overlay ${props.type}`}
            style={{
                opacity,
                display: loading === false ? 'none' : 'flex',
                backgroundColor:
                    props.type === 'semi-transparent'
                        ? themeStore.theme === 'dark'
                            ? '#292929aa'
                            : '#ffffffaa'
                        : '',
            }}
        >
            <div className='custom-loader'>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </div>
    );
});

LoadingOverlay.propTypes = {
    loading: PropTypes.bool,
    type: PropTypes.oneOf(['normal', 'semi-transparent']),
};

LoadingOverlay.defaultProps = {
    loading: true,
    type: 'normal',
};
