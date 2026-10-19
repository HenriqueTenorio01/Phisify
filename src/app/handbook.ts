export interface SourceSlice {
  page: string
  start?: number
  end?: number
}

export interface VectorFragment {
  src: string
  width: number
  height: number
}

export interface HandbookRun {
  text: string
  bold?: boolean
  italic?: boolean
  math?: VectorFragment
}

export interface HandbookBlock {
  type: 'heading' | 'paragraph' | 'equation' | 'figure' | 'table'
  text: string
  level?: number
  boxed?: boolean
  runs?: HandbookRun[]
  rows?: Array<{ symbol: HandbookRun[]; meaning: HandbookRun[] }>
  columns?: string[]
  cells?: HandbookRun[][][]
  mathml?: string
  image?: VectorFragment
  source: {
    document: 'aula' | 'ficha' | 'complemento' | `universidade-${string}`
    page: number
    blocks: number[]
  }
}

export interface HandbookLesson {
  sourceLesson?: number
  chapter?: number
  chapterTitle?: string
  topicId?: string
  id: string
  unit: string
  title: string
  description: string
  minutes: number
  pages?: number
  estimatedPages?: boolean
  previousIds?: string[]
  refs: SourceSlice[]
}
