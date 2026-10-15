import type { HandbookBlock, VectorFragment } from '../../app/handbook'
import './handbook.css'

export function SourceVector({
  image,
  label,
  inline = false,
}: {
  image: VectorFragment
  label: string
  inline?: boolean
}) {
  const vector = (
    <svg
      className={inline ? 'handbook-inline-math' : 'handbook-vector'}
      viewBox={`0 0 ${image.width} ${image.height}`}
      role="img"
      aria-label={label}
      style={{
        width: `${image.width / 10.9}em`,
        height: `${image.height / 10.9}em`,
      }}
    >
      <use href={image.src} />
    </svg>
  )
  return inline ? (
    <span className="handbook-inline-scroll">{vector}</span>
  ) : (
    vector
  )
}

export const blockAnchor = (block: HandbookBlock, prefix: string) =>
  `${prefix}-${block.source.document}-${block.source.page}-${block.source.blocks.join('-')}`

export function HandbookBlocks({
  blocks,
  prefix = 'book',
}: {
  blocks: HandbookBlock[]
  prefix?: string
}) {
  return (
    <div className="handbook-body">
      {blocks.map((block, index) => {
        const id = blockAnchor(block, prefix)
        if (block.type === 'heading') {
          const Tag = block.level === 4 ? 'h4' : block.level === 3 ? 'h3' : 'h2'
          return (
            <Tag
              key={index}
              id={id}
              className={block.boxed ? 'handbook-result-title' : undefined}
            >
              {block.text}
            </Tag>
          )
        }
        if (block.type === 'equation' && block.image) {
          return (
            <div
              key={index}
              className="handbook-equation"
              tabIndex={0}
              aria-label="Equação; role horizontalmente se necessário"
            >
              <SourceVector image={block.image} label={block.text} />
            </div>
          )
        }
        if (block.type === 'figure' && block.image) {
          return (
            <figure key={index} className="handbook-figure">
              <SourceVector image={block.image} label={block.text} />
              <figcaption>{block.text}</figcaption>
            </figure>
          )
        }
        return (
          <p
            key={index}
            className={
              /^(Hipóteses e alcance|Quando usar|Modelo\.|Distinção útil)/.test(
                block.text,
              )
                ? 'handbook-assumptions'
                : undefined
            }
          >
            {block.runs?.map((run, i) =>
              run.math ? (
                <SourceVector
                  key={i}
                  image={run.math}
                  label={run.text}
                  inline
                />
              ) : run.bold ? (
                <strong key={i}>{run.text}</strong>
              ) : run.italic ? (
                <em key={i}>{run.text}</em>
              ) : (
                <span key={i}>{run.text}</span>
              ),
            )}
          </p>
        )
      })}
    </div>
  )
}
