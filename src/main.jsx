import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// DEBUG LOGGING
try {
    const logBox = document.getElementById('debug-log');
    if (logBox) logBox.innerText += "✅ JS: main.jsx loaded.\n";
    console.log("Main.jsx execution started");
} catch (e) {
    console.error("Debug log failed", e);
}

root.render(
    <React.StrictMode>
        <BrowserRouter basename="/op-room-manager">
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
