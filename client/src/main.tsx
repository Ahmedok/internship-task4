import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
    throw new Error('Failed to find le root');
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
