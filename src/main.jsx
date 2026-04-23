import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ToastProvider } from './context/ToastContext'

import { SupabaseDataProvider } from './context/SupabaseDataContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SupabaseDataProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </SupabaseDataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
