import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { AppNavbar } from '../components';
import { NotFound } from './NotFound';
import { Payload } from './Payload';
import { Victims } from './Victims';

export const Pages: React.FC = () => {
    return (
        <Routes>
            <Route path='/404' element={<NotFound />} />

            <Route element={<AppNavbar />}>
                <Route index element={<Navigate to='/victims' />} />

                <Route path='/victims/*' element={<Victims />} />
                <Route path='/payload' element={<Payload />} />
            </Route>

            <Route path='*' element={<Navigate to='/404' />} />
        </Routes>
    );
};
