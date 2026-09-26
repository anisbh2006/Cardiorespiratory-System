// Uses Google's public translation endpoint; generated medical translations require expert review.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(root, 'src/content')
const manifest = JSON.parse(await readFile(path.join(contentRoot, 'manifest.json'), 'utf8'))
const selectedIds = new Set(process.argv.slice(2).filter((value) => value !== '--force'))
const force = process.argv.includes('--force')
const protectedKeys = new Set([
  'file', 'chapterId', 'discipline', 'kind', 'n', 'type', 'level', 'src', 'modelId',
  'id', 'symbol', 'credit',
])

function collectStrings(value, key = '', parentType = '', entries = []) {
  if (typeof value === 'string') {
    return entries
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === 'string') {
        if (!protectedKeys.has(key) && parentType !== 'equation') {
          entries.push({ value: item, set: (translated) => { value[index] = translated } })
        }
      } else {
        collectStrings(item, String(index), parentType, entries)
      }
    })
    return entries
  }
  if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) {
      if (typeof child === 'string') {
        if (!protectedKeys.has(childKey) && !(value.type === 'equation' && childKey === 'text')) {
          entries.push({
            value: child,
            set: (translated) => { value[childKey] = translated },
          })
        }
      } else {
        collectStrings(child, childKey, value.type ?? parentType, entries)
      }
    }
  }
  return entries
}

function makeBatches(entries) {
  const batches = []
  let batch = []
  let size = 0
  for (const entry of entries) {
    if (!entry.value.trim()) continue
    const pieces = []
    let offset = 0
    while (offset < entry.value.length) {
      let end = Math.min(offset + 1200, entry.value.length)
      if (end < entry.value.length) {
        const boundary = entry.value.lastIndexOf(' ', end)
        if (boundary > offset) end = boundary
      }
      pieces.push(entry.value.slice(offset, end))
      offset = end
    }
    if (pieces.length > 1) {
      if (batch.length) batches.push(batch)
      batch = []
      size = 0
      batches.push(pieces.map((value, index) => ({ value, entry, index, count: pieces.length })))
      continue
    }
    const markerSize = 20
    if (batch.length && size + entry.value.length + markerSize > 1000) {
      batches.push(batch)
      batch = []
      size = 0
    }
    batch.push({ value: entry.value, entry, index: 0, count: 1 })
    size += entry.value.length + markerSize
  }
  if (batch.length) batches.push(batch)
  return batches
}

async function translateBatch(batch) {
  const markers = batch.map((_, index) => `ZXQSEG${String(index).padStart(5, '0')}QXZ`)
  const input = batch.map((item, index) => `${markers[index]}\n${item.value}`).join('\n') + '\nZXQENDQXZ'
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', 'en')
  url.searchParams.set('tl', 'fr')
  url.searchParams.set('dt', 't')
  url.searchParams.set('q', input)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json()
      const translated = payload[0].map((segment) => segment[0]).join('')
      const positions = markers.map((marker) => translated.indexOf(marker))
      if (positions.some((position) => position < 0) || !translated.includes('ZXQENDQXZ')) {
        throw new Error('Translation response did not preserve segment markers')
      }
      for (let index = 0; index < batch.length; index += 1) {
        const start = positions[index] + markers[index].length
        const end = index + 1 < batch.length ? positions[index + 1] : translated.indexOf('ZXQENDQXZ')
        const result = translated.slice(start, end).trim()
        const item = batch[index]
        item.translated = result
      }
      return
    } catch (error) {
      if (attempt === 4) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
}

async function runWithLimit(tasks, limit = 3) {
  let cursor = 0
  await Promise.all(Array.from({ length: limit }, async () => {
    while (cursor < tasks.length) {
      const index = cursor++
      await tasks[index]()
    }
  }))
}

async function translateDocument(document) {
  const entries = collectStrings(document)
  const batches = makeBatches(entries)
  await runWithLimit(batches.map((batch) => async () => translateBatch(batch)))
  for (const batch of batches) {
    for (const item of batch) {
      item.translated ??= item.value
    }
  }
  for (const entry of entries) {
    const pieces = batches.flat().filter((item) => item.entry === entry)
    if (pieces.length) {
      const leading = entry.value.match(/^\s*/)?.[0] ?? ''
      const trailing = entry.value.match(/\s*$/)?.[0] ?? ''
      entry.set(`${leading}${pieces.map((item) => item.translated).join(' ').trim()}${trailing}`)
    }
  }
  return document
}

const chaptersById = new Map()
for (const item of manifest) {
  if (selectedIds.size && !selectedIds.has(item.chapterId)) continue
  const directory = path.join(contentRoot, item.discipline)
  const sourcePath = path.join(directory, `${item.chapterId}.json`)
  const targetPath = path.join(directory, `${item.chapterId}.fr.json`)
  let chapter
  if (!force) {
    try {
      chapter = JSON.parse(await readFile(targetPath, 'utf8'))
      chaptersById.set(item.chapterId, chapter)
      console.log(`skip ${item.chapterId}: already translated`)
      continue
    } catch {
      // Generate a missing sidecar.
    }
  }
  chapter = JSON.parse(await readFile(sourcePath, 'utf8'))
  await translateDocument(chapter)
  await writeFile(targetPath, `${JSON.stringify(chapter, null, 2)}\n`)
  chaptersById.set(item.chapterId, chapter)
  console.log(`translated ${item.chapterId}`)
}

const frenchManifest = []
for (const item of manifest) {
  try {
    const translated = chaptersById.get(item.chapterId) ?? JSON.parse(
      await readFile(path.join(contentRoot, item.discipline, `${item.chapterId}.fr.json`), 'utf8')
    )
    frenchManifest.push({
      chapterId: item.chapterId,
      title: translated.title,
      topics: translated.pages.flatMap((page) => page.blocks.filter((block) => block.type === 'heading').map((block) => block.text)),
    })
  } catch {
    break
  }
}
if (frenchManifest.length === manifest.length) {
  await mkdir(contentRoot, { recursive: true })
  await writeFile(path.join(contentRoot, 'manifest.fr.json'), `${JSON.stringify(frenchManifest, null, 2)}\n`)
} else {
  console.log(`French manifest unchanged: ${frenchManifest.length}/${manifest.length} chapters translated`)
}