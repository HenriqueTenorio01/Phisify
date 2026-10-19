import sourcePages from './source-pages.json'
import { createSchoolReader } from '../create-reader'

export const { handbookPages, resolveSource, sourceLabel } = createSchoolReader(
  sourcePages,
  'Eletricidade e eletromagnetismo',
)
