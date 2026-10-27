import { installVisualTruthPatches } from './visual-truth.generated'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

installVisualTruthPatches()

if (import.meta.env.DEV) {
  void import('./visual-truth.dev').then(({ mountVisualTruth }) => mountVisualTruth())
}
