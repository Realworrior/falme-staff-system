import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { NavigationProvider } from './context/NavigationContext'
import { ToastProvider } from './context/ToastContext'
import { FirebaseDataProvider } from './context/FirebaseDataContext'
import { SupabaseDataProvider } from './context/SupabaseDataContext'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <NavigationProvider>
          <FirebaseDataProvider>
            <SupabaseDataProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </SupabaseDataProvider>
          </FirebaseDataProvider>
        </NavigationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
