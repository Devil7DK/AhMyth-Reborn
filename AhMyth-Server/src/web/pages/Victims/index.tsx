import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Live } from './Live/Live';

export const Victims: React.FC = () => {
    return (
        <Routes>
            <Route path='live' element={<Live />} />

            <Route index element={<Navigate to='live' />} />

            <Route path='*' element={<Navigate to='/404' />} />
        </Routes>
    );
};
