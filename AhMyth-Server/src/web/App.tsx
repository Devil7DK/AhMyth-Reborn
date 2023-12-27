import './App.scss';

import React, { useLayoutEffect } from 'react';

export const App: React.FC = () => {
    useLayoutEffect(() => {
        const preloader = document.getElementById('preloader');

        if (preloader !== null) {
            preloader.style.opacity = '0';

            setTimeout(() => {
                preloader.remove();
            }, 500);
        }
    }, []);

    return <h1>Hello World</h1>;
};
