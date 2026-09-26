import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { StudyProvider } from '@/features/study/StudyContext'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { LanguageProvider } from '@/context/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <StudyProvider>
          <ScrollToTop />
          <App />
        </StudyProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
