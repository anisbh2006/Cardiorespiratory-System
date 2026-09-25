import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Image extensions browsers can render natively in an <img>. */
const RENDERABLE_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp'])

/**
 * Some supplied course figures are Windows metafiles (.emf/.wmf) that no browser
 * can render. Rather than showing a broken-image icon (or inventing a replace
 * figure), callers detect this and present the real caption with an honest
 * "unsupported source format" notice.
 */
export function isRenderableImage(src: string): boolean {
  const ext = src.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() ?? ''
  return RENDERABLE_IMAGE_EXT.has(ext)
}
