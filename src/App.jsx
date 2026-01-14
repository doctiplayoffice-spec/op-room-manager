import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ManagementApp from './pages/ManagementApp';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<ManagementApp />} />
        </Routes>
    );
};

export default App;
