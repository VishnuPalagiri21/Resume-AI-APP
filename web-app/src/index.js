import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1) Patch ResizeObserver to use requestAnimationFrame, permanently preventing layout-loop errors
if (typeof window !== 'undefined' && window.ResizeObserver) {
  const _ResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        window.requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  };
}

// 2) Suppress React dev error overlay for benign ResizeObserver loop notices and handled API errors
const isResizeObserverError = (msg) => {
  if (!msg) return false;
  const str = typeof msg === 'string' ? msg : (msg.message || msg.toString() || '');
  return str.includes('ResizeObserver') || str.includes('undelivered notifications') || str.includes('loop limit exceeded');
};

const _origOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (isResizeObserverError(message) || isResizeObserverError(error)) {
    return true; // true = handled, do not display overlay
  }
  if (_origOnError) {
    return _origOnError.apply(this, arguments);
  }
  return false;
};

const shouldSuppressError = (err) => {
  if (!err) return false;
  if (isResizeObserverError(err)) return true;
  if (!(err instanceof Error) && typeof err === 'object') return true;
  const msg = typeof err === 'string'
    ? err
    : (err.message || err.error || err.statusText || '');
  const status = err.status || err.statusCode || 0;
  return (
    isResizeObserverError(msg) ||
    msg.includes('Request failed') ||
    msg.includes('Network Error') ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('404') ||
    msg.includes('500') ||
    status >= 400
  );
};

window.addEventListener('unhandledrejection', (event) => {
  if (shouldSuppressError(event.reason)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, { capture: true });

window.addEventListener('error', (event) => {
  if (isResizeObserverError(event.message) || isResizeObserverError(event.error) || shouldSuppressError(event.error || event.message)) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, { capture: true });


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
