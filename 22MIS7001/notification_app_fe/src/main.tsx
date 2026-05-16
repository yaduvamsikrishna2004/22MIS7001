import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@app/App';
import { AppProviders } from '@providers/app-providers';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
