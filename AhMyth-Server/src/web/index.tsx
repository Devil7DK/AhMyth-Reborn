import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App';
import { StoreProvider } from './store';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => void })
    ._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

createRoot(document.getElementById('root') as HTMLDivElement).render(
    <StoreProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StoreProvider>,
);
