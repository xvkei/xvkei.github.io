import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/tokens.css';
import './styles/base.css';
import './styles/desktop.css';
import './styles/window.css';
import './styles/apps.css';
import './styles/mobile.css';
import { initTheme } from './lib/theme';

const root = document.getElementById('root');
if (!root) throw new Error('#root element missing from index.html');

initTheme();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);