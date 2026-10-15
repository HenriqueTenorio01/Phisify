import sourcePages from './source-pages.json'
import complements from './complements.json'
import type { HandbookBlock, SourceSlice } from '../../../src/app/handbook'

export const handbookPages = { ...sourcePages, ...complements } as Record<
  string,
  HandbookBlock[]
>
export function resolveSource(refs: SourceSlice[]): HandbookBlock[] {
  return refs.flatMap((ref) =>
    (handbookPages[ref.page] ?? []).slice(ref.start ?? 0, ref.end),
  )
}
export function sourceLabel(refs: SourceSlice[]) {
  const pages = [...new Set(refs.map((ref) => ref.page))]
  const label = (prefix: string) =>
    pages
      .filter((page) => page.startsWith(prefix + '-'))
      .map((page) => page.split('-')[1])
      .join(', ')
  return [
    label('aula') && `Apostila de Mecânica · páginas PDF ${label('aula')}`,
    label('ficha') && `Ficha de Mecânica · páginas PDF ${label('ficha')}`,
    pages.some((page) => page.startsWith('complemento-')) &&
      'Ampliação conceitual: Phisify',
  ]
    .filter(Boolean)
    .join(' · ')
}
