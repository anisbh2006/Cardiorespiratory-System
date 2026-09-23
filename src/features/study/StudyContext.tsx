import * as React from 'react'

const STORAGE_KEY = 'uei01.study.v1'

export interface RecentItem {
  lessonId: string
  title: string
  disciplineSlug: string
  at: number
}

export interface StudyState {
  completedLessons: string[]
  bookmarks: string[]
  recentlyViewed: RecentItem[]
  searchHistory: string[]
}

const initialState: StudyState = {
  completedLessons: [],
  bookmarks: [],
  recentlyViewed: [],
  searchHistory: [],
}

type Action =
  | { type: 'toggle-complete'; lessonId: string }
  | { type: 'toggle-bookmark'; itemId: string }
  | { type: 'record-view'; item: RecentItem }
  | { type: 'record-search'; query: string }
  | { type: 'clear-search-history' }
  | { type: 'reset' }

function reducer(state: StudyState, action: Action): StudyState {
  switch (action.type) {
    case 'toggle-complete': {
      const has = state.completedLessons.includes(action.lessonId)
      return {
        ...state,
        completedLessons: has
          ? state.completedLessons.filter((id) => id !== action.lessonId)
          : [...state.completedLessons, action.lessonId],
      }
    }
    case 'toggle-bookmark': {
      const has = state.bookmarks.includes(action.itemId)
      return {
        ...state,
        bookmarks: has
          ? state.bookmarks.filter((id) => id !== action.itemId)
          : [...state.bookmarks, action.itemId],
      }
    }
    case 'record-view': {
      const filtered = state.recentlyViewed.filter((r) => r.lessonId !== action.item.lessonId)
      return {
        ...state,
        recentlyViewed: [action.item, ...filtered].slice(0, 20),
      }
    }
    case 'record-search': {
      const q = action.query.trim()
      if (!q) return state
      const filtered = state.searchHistory.filter((s) => s.toLowerCase() !== q.toLowerCase())
      return { ...state, searchHistory: [q, ...filtered].slice(0, 10) }
    }
    case 'clear-search-history':
      return { ...state, searchHistory: [] }
    case 'reset':
      return initialState
  }
}

function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...(JSON.parse(raw) as Partial<StudyState>) }
  } catch {
    return initialState
  }
}

interface StudyContextValue extends StudyState {
  toggleComplete: (lessonId: string) => void
  toggleBookmark: (itemId: string) => void
  recordView: (item: RecentItem) => void
  recordSearch: (query: string) => void
  clearSearchHistory: () => void
  isCompleted: (lessonId: string) => boolean
  isBookmarked: (itemId: string) => boolean
}

const StudyContext = React.createContext<StudyContextValue | null>(null)

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, undefined, loadState)

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable (private mode etc.) — study features degrade silently
    }
  }, [state])

  const value = React.useMemo<StudyContextValue>(
    () => ({
      ...state,
      toggleComplete: (lessonId) => dispatch({ type: 'toggle-complete', lessonId }),
      toggleBookmark: (itemId) => dispatch({ type: 'toggle-bookmark', itemId }),
      recordView: (item) => dispatch({ type: 'record-view', item }),
      recordSearch: (query) => dispatch({ type: 'record-search', query }),
      clearSearchHistory: () => dispatch({ type: 'clear-search-history' }),
      isCompleted: (lessonId) => state.completedLessons.includes(lessonId),
      isBookmarked: (itemId) => state.bookmarks.includes(itemId),
    }),
    [state]
  )

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy(): StudyContextValue {
  const ctx = React.useContext(StudyContext)
  if (!ctx) throw new Error('useStudy must be used within StudyProvider')
  return ctx
}
