import type { HandbookBlock, SourceSlice } from '../../../src/app/handbook'

// Each apostila is a separate lazy chunk; opening Aula 01 does not download 02–06.
const loaders = {
  1: () => import('./aula01-pages.json'),
  2: () => import('./aula02-pages.json'),
  3: () => import('./aula03-pages.json'),
  5: () => import('./aula05-pages.json'),
  6: () => import('./aula06-pages.json'),
}
export async function loadUniversityReader(number: number) {
  const loader = loaders[number as keyof typeof loaders]
  if (!loader) throw new Error(`Aula universitária indisponível: ${number}`)
  const module = await loader()
  const handbookPages = module.default as Record<string, HandbookBlock[]>
  return {
    handbookPages,
    resolveSource: (refs: SourceSlice[]): HandbookBlock[] =>
      refs.flatMap((ref) =>
        (handbookPages[ref.page] ?? []).slice(ref.start ?? 0, ref.end),
      ),
    sourceLabel: (refs: SourceSlice[]) =>
      `Coleção universitária Phisify · Aula ${String(number).padStart(2, '0')} · páginas PDF ${[...new Set(refs.map((ref) => ref.page.split('-')[1]))].join(', ')}`,
  }
}
