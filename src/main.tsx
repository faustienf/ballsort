import React from 'react';
import ReactDOM from 'react-dom/client';
import { createCtx } from '@reatom/framework';
import { reatomContext } from '@reatom/npm-react';
import { App } from './app';

const ctx = createCtx();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <reatomContext.Provider value={ctx}>
      <App />
    </reatomContext.Provider>
  </React.StrictMode>
);
