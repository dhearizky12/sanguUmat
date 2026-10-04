import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { captureTokenFromUrl } from './lib/api'
import './index.css'
import App from './App.jsx'

// Before anything renders or fetches: pick up the token the API left in the URL.
captureTokenFromUrl()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
