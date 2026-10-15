import sourcePages from './source-pages.json'
import type { HandbookBlock, SourceSlice } from '../../../src/app/handbook'

export const handbookPages = sourcePages as Record<string, HandbookBlock[]>
export function resolveSource(refs: SourceSlice[]): HandbookBlock[] {
  return refs.flatMap((ref) =>
    (handbookPages[ref.page] ?? []).slice(ref.start ?? 0, ref.end),
  )
}
export function sourceLabel(refs: SourceSlice[]) {
  const pages = [...new Set(refs.map((ref) => ref.page))]
  const label = (prefix: string) =>
    pages
      .filter((page) => page.startsWith(prefix))
      .map((page) => page.split('-')[1])
      .join(', ')
  return [
    label('aula') && `Apostila · páginas PDF ${label('aula')}`,
    label('ficha') && `Ficha · páginas PDF ${label('ficha')}`,
  ]
    .filter(Boolean)
    .join(' · ')
}
