import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FlashcardProvider } from './context/FlashcardContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlashcardProvider>
      <App />
    </FlashcardProvider>
  </StrictMode>,
)
