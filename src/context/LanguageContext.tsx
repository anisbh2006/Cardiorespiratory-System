import * as React from 'react'
import { getStoredLanguage, getTranslation, resolveLanguage, setStoredLanguage, type Language } from '@/i18n'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (path: string, values?: Record<string, string | number>) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => getStoredLanguage())

  const setLanguage = React.useCallback((nextLanguage: Language) => {
    const safe = resolveLanguage(nextLanguage)
    setLanguageState(safe)
    setStoredLanguage(safe)
  }, [])

  const t = React.useCallback(
    (path: string, values: Record<string, string | number> = {}) => {
      const value = getTranslation(language, path)
      return value.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`))
    },
    [language]
  )

  React.useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = 'ltr'
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside a LanguageProvider')
  }
  return context
}
