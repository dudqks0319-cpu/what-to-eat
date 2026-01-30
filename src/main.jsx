import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FeaturesProvider } from './context/FeaturesContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FeaturesProvider>
      <App />
    </FeaturesProvider>
  </StrictMode>,
)
