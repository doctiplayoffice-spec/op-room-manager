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

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
                    <h1>Something went wrong.</h1>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter basename="/op-room-manager">
                <App />
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
