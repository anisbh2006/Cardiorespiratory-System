import { defaultLanguage, translations, type Language } from './translations'

export type { Language } from './translations'
export { defaultLanguage, translations }

const STORAGE_KEY = 'medcore-language'

export function resolveLanguage(value: string | null | undefined): Language {
  return value === 'fr' ? 'fr' : 'en'
}

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage
  return resolveLanguage(window.localStorage.getItem(STORAGE_KEY))
}

export function setStoredLanguage(language: Language) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, language)
}

export function getTranslation(language: Language, path: string): string {
  const raw = path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment]
    }
    return undefined
  }, translations[language] as unknown)

  if (typeof raw === 'string') return raw

  const fallback = path.split('.').reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment]
    }
    return undefined
  }, translations[defaultLanguage] as unknown)

  return typeof fallback === 'string' ? fallback : path
}

export function formatTranslation(language: Language, path: string, values: Record<string, string | number> = {}) {
  return getTranslation(language, path).replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`))
}
