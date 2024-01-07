import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { GenerateAPK } from './GenerateAPK/GenerateAPK';
import { ListPayloads } from './ListPayloads/ListPayloads';

export const Payload: React.FC = () => {
    return (
        <Routes>
            <Route path='generate' element={<GenerateAPK />} />
            <Route path='list' element={<ListPayloads />} />

            <Route index element={<Navigate to='generate' />} />

            <Route path='*' element={<Navigate to='/404' />} />
        </Routes>
    );
};
