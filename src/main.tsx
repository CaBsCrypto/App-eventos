import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AppProvider} from './state/AppProvider';
import PrivyAppProvider from './state/PrivyAppProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyAppProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </PrivyAppProvider>
  </StrictMode>,
);
