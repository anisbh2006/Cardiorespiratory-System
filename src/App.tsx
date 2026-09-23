import * as React from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'

const HomePage = React.lazy(() => import('@/pages/HomePage'))
const DisciplinePage = React.lazy(() => import('@/pages/DisciplinePage'))
const LessonPage = React.lazy(() => import('@/pages/LessonPage'))
const AnatomyPage = React.lazy(() => import('@/pages/AnatomyPage'))
const HistologyPage = React.lazy(() => import('@/pages/HistologyPage'))
const BiophysicsPage = React.lazy(() => import('@/pages/BiophysicsPage'))
const PhysiologyPage = React.lazy(() => import('@/pages/PhysiologyPage'))
const SearchPage = React.lazy(() => import('@/pages/SearchPage'))
const StudyPage = React.lazy(() => import('@/pages/StudyPage'))
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-14">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
          Chargement…
        </span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <React.Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/discipline/:slug" element={<DisciplinePage />} />
          <Route path="/discipline/:slug/:chapterId/:lessonId" element={<LessonPage />} />
          <Route path="/anatomy" element={<AnatomyPage />} />
          <Route path="/histologie" element={<HistologyPage />} />
          <Route path="/biophysique" element={<BiophysicsPage />} />
          <Route path="/physiologie" element={<PhysiologyPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </React.Suspense>
  )
}
