import type { HandbookBlock, SourceSlice } from '../../src/app/handbook'

export function createSchoolReader(sourcePages: unknown, title: string) {
  const handbookPages = sourcePages as Record<string, HandbookBlock[]>
  return {
    handbookPages,
    resolveSource: (refs: SourceSlice[]) =>
      refs.flatMap((ref) =>
        (handbookPages[ref.page] ?? []).slice(ref.start ?? 0, ref.end),
      ),
    sourceLabel: (refs: SourceSlice[]) =>
      (['aula', 'ficha'] as const)
        .map((document) => {
          const pages = [
            ...new Set(
              refs
                .filter((r) => r.page.startsWith(document + '-'))
                .map((r) => Number(r.page.split('-')[1])),
            ),
          ].sort((a, b) => a - b)
          return pages.length
            ? `${document === 'aula' ? 'Apostila' : 'Ficha'} de ${title} · páginas PDF ${pages.join(', ')}`
            : ''
        })
        .filter(Boolean)
        .join(' · '),
  }
}
