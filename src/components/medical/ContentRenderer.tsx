import { Fragment } from 'react'
import { AccordionItem } from '@/components/ui/accordion'
import { Callout } from './Callout'
import { DataTable } from './DataTable'
import { DefinitionBox } from './DefinitionBox'
import { EquationBlock } from './EquationBlock'
import { ImageFigure } from './ImageFigure'
import type { ContentBlock, Topic } from '@/data/types'

/**
 * Renders typed lecturee content blocks exactly as supplied.
 * All medical information flows from src/data — this component never
 * generates content of its own.
 */
export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </div>
  )
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading': {
      const Tag = block.level === 2 ? 'h2' : block.level === 3 ? 'h3' : 'h4'
      const sizes = {
        2: 'text-2xl font-semibold tracking-tight text-foreground',
        3: 'text-xl font-semibold text-foreground',
        4: 'text-base font-semibold text-foreground/90',
      } as const
      return (
        <Tag className={`${sizes[block.level]} font-serif mt-8 scroll-mt-24 first:mt-0`}>
          {block.text}
        </Tag>
      )
    }
    case 'paragraph':
      return <p className="text-[15px] leading-8 text-foreground/85">{block.text}</p>
    case 'definition':
      return <DefinitionBox term={block.term}>{block.text}</DefinitionBox>
    case 'note':
      return <Callout variant={block.variant} title={block.title}>{block.text}</Callout>
    case 'list':
      return block.ordered ? (
        <ol className="ml-5 list-decimal space-y-1.5 text-[15px] leading-7 text-foreground/85 marker:text-primary">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="ml-5 list-disc space-y-1.5 text-[15px] leading-7 text-foreground/85 marker:text-primary">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'table':
      return <DataTable headers={block.headers} rows={block.rows} caption={block.caption} />
    case 'image':
      return <ImageFigure src={block.src} caption={block.caption} credit={block.credit} />
    case 'equation':
      return <EquationBlock text={block.text} variables={block.variables} />
    case 'model3d':
      return (
        <div className="my-6 rounded-lg border border-border bg-elevated p-4 text-center text-xs text-muted">
          {/* 3D model slot — resolved through the model registry when available */}
          3D model: <span className="font-mono text-primary">{block.modelId}</span>
          {block.caption && <span className="ml-2">{block.caption}</span>}
        </div>
      )
    case 'expandable':
      return (
        <AccordionItem title={<span className="text-foreground">{block.title}</span>}>
          <ContentRenderer blocks={block.blocks} />
        </AccordionItem>
      )
  }
}

/** Renders a lesson topic tree (Topic → Subtopic) with sticky-friendly anchors. */
export function TopicRenderer({ topic, depth = 0 }: { topic: Topic; depth?: number }) {
  return (
    <section id={topic.id} className="scroll-mt-24">
      <h2
        className={
          depth === 0
            ? 'mt-10 font-serif text-2xl font-semibold tracking-tight text-foreground first:mt-0'
            : 'mt-6 text-lg font-semibold text-foreground'
        }
      >
        {topic.title}
      </h2>
      {topic.blocks && (
        <div className="mt-4">
          <ContentRenderer blocks={topic.blocks} />
        </div>
      )}
      {topic.subtopics?.map((sub) => (
        <Fragment key={sub.id}>
          <TopicRenderer topic={sub} depth={depth + 1} />
        </Fragment>
      ))}
    </section>
  )
}
