import './App.scss';

import {
    type BrandVariants,
    createDarkTheme,
    createLightTheme,
    FluentProvider,
    type Theme,
} from '@fluentui/react-components';
import { observer } from 'mobx-react-lite';
import React, { useLayoutEffect } from 'react';

import { Pages } from './pages';
import { useStore } from './store';

const customTheme: BrandVariants = {
    10: '#020306',
    20: '#0F1826',
    30: '#102744',
    40: '#0C335C',
    50: '#033F75',
    60: '#004C8B',
    70: '#005AA2',
    80: '#0067B9',
    90: '#0075D0',
    100: '#0083E9',
    110: '#0F92FF',
    120: '#559FFF',
    130: '#78ADFF',
    140: '#95BCFF',
    150: '#AECAFF',
    160: '#C6D9FF',
};

const lightTheme: Theme = {
    ...createLightTheme(customTheme),
};

const darkTheme: Theme = {
    ...createDarkTheme(customTheme),
};

darkTheme.colorBrandForeground1 = customTheme[110];
darkTheme.colorBrandForeground2 = customTheme[120];

export const App: React.FC = observer(() => {
    const { themeStore } = useStore();

    useLayoutEffect(() => {
        const preloader = document.getElementById('preloader');

        if (preloader !== null) {
            preloader.style.opacity = '0';

            setTimeout(() => {
                preloader.remove();
            }, 500);
        }
    }, []);

    return (
        <FluentProvider
            theme={themeStore.theme === 'dark' ? darkTheme : lightTheme}
        >
            <Pages />
        </FluentProvider>
    );
});
