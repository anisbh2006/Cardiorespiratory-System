import * as React from 'react'
import { TopicRenderer } from './ContentRenderer'
import { AwaitingContent } from './AwaitingContent'
import { buildTopics, loadChapter } from '@/data/contentLoader'
import type { Topic } from '@/data/types'

interface LessonContentProps {
  discipline: string
  chapterId: string
  lessonTitle: string
  /** Reports the built topic list upward so the page can render the TOC. */
  onTopics?: (topics: Topic[]) => void
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="shimmer h-7 w-2/3 rounded-md bg-overlay" />
      <div className="shimmer h-4 w-full rounded bg-overlay/70" />
      <div className="shimmer h-4 w-11/12 rounded bg-overlay/70" />
      <div className="shimmer h-4 w-9/12 rounded bg-overlay/70" />
      <div className="shimmer h-56 w-full rounded-xl bg-overlay/60" />
      <div className="shimmer h-4 w-10/12 rounded bg-overlay/70" />
      <span className="sr-only">Loading lesson content…</span>
    </div>
  )
}

/**
 * Loads a chapter's generated JSON on demand (code-split chunk) and renders its
 * source-ordered content as topics. Reports the topic list to the parent for
 * the table of contents. Never fabricates content — on a load failure it shows
 * the explicit "awaiting source" state.
 */
export function LessonContent({
  discipline,
  chapterId,
  lessonTitle,
  onTopics,
}: LessonContentProps) {
  const [topics, setTopics] = React.useState<Topic[] | null>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    setTopics(null)
    setFailed(false)
    loadChapter(discipline, chapterId)
      .then((raw) => {
        if (!alive) return
        const built = buildTopics(raw.pages)
        setTopics(built)
        onTopics?.(built)
      })
      .catch(() => {
        if (alive) setFailed(true)
      })
    return () => {
      alive = false
    }
    // onTopics intentionally omitted: it is a stable state setter from the parent.
  }, [discipline, chapterId])

  if (failed) {
    return (
      <AwaitingContent
        title={`« ${lessonTitle} » — content awaiting integration`}
        description="Le contenu de cette leçon sera intégré tel quel depuis les fichiers de lecture fournis, sans réécriture ni invention."
      />
    )
  }

  if (!topics) return <LoadingSkeleton />

  return (
    <>
      {topics.map((topic) => (
        <TopicRenderer key={topic.id} topic={topic} />
      ))}
    </>
  )
}
