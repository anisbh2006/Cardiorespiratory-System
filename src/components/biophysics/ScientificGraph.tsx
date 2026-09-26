import { motion } from 'framer-motion'

interface ScientificGraphProps {
  title: string
  xLabel: string
  yLabel: string
  xValue: number
  flowValue: number
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function ScientificGraph({
  title,
  xLabel,
  yLabel,
  xValue,
  flowValue,
  minX,
  maxX,
  minY,
  maxY,
}: ScientificGraphProps) {
  const width = 420
  const height = 220
  const padding = 30

  const projectX = (v: number) => padding + ((v - minX) / (maxX - minX)) * (width - padding * 2)
  const projectY = (v: number) => height - padding - ((v - minY) / (maxY - minY)) * (height - padding * 2)

  const values = Array.from({ length: 40 }, (_, i) => {
    const x = minX + (i / 39) * (maxX - minX)
    const y = (x / (maxX / 2 + 0.01)) ** 4 * ((maxY - minY) * 0.72)
    return { x, y }
  })

  const linePath = values.map((point, index) => `${index === 0 ? 'M' : 'L'} ${projectX(point.x)} ${projectY(point.y)}`).join(' ')
  const currentX = projectX(xValue)
  const currentY = projectY(flowValue)

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-foreground">{title}</h3>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{xLabel} vs {yLabel}</div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <rect x={0} y={0} width={width} height={height} fill="rgba(11,11,14,0.8)" rx={16} />

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const x = padding + tick * (width - padding * 2)
          const y = padding + tick * (height - padding * 2)
          return (
            <g key={`${tick}-grid`}>
              <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="rgba(255,255,255,0.07)" />
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.07)" />
            </g>
          )
        })}

        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#7b7b86" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#7b7b86" />

        <motion.path
          d={linePath}
          fill="none"
          stroke="#e0243a"
          strokeWidth={2.5}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />

        <line x1={currentX} y1={height - padding} x2={currentX} y2={currentY} stroke="rgba(224,36,58,0.45)" strokeDasharray="4 4" />
        <line x1={padding} y1={currentY} x2={currentX} y2={currentY} stroke="rgba(224,36,58,0.45)" strokeDasharray="4 4" />

        <motion.circle
          cx={currentX}
          cy={currentY}
          r={6}
          fill="#f4f4f2"
          stroke="#e0243a"
          strokeWidth={2}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.25 }}
        />

        <text x={width / 2} y={height - 8} textAnchor="middle" fill="#b8b8c0" fontSize="11">{xLabel}</text>
        <text x={18} y={height / 2} fill="#b8b8c0" fontSize="11" transform={`rotate(-90 18 ${height / 2})`} textAnchor="middle">{yLabel}</text>
      </svg>
    </div>
  )
}
