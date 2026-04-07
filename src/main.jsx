import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { NavigationProvider } from './context/NavigationContext'
import { ToastProvider } from './context/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NavigationProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </NavigationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
