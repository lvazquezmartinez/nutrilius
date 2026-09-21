import { useMemo, useState } from 'react'
import { clsx } from 'clsx'
import type { ClinicalEvolution } from '@/types/clinicalEvolution'

// ── métricas graficables ────────────────────────────────────────────────────────
type MetricKey = 'weightKg' | 'bmi' | 'muscleMassPercentage' | 'bodyFatPercentage' | 'waistCm'

const METRICS: { key: MetricKey; label: string; unit: string; color: string; decimals: number }[] = [
  { key: 'weightKg',             label: 'Peso',      unit: 'kg', color: '#1E4D6B', decimals: 1 },
  { key: 'bmi',                  label: 'IMC',       unit: '',   color: '#0F766E', decimals: 1 },
  { key: 'muscleMassPercentage', label: '% Músculo', unit: '%',  color: '#3DAA7F', decimals: 1 },
  { key: 'bodyFatPercentage',    label: '% Grasa',   unit: '%',  color: '#C2673B', decimals: 1 },
  { key: 'waistCm',              label: 'Cintura',   unit: 'cm', color: '#7C5CBF', decimals: 0 },
]

type Point = { date: string; value: number }

function fmt(n: number, decimals: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

function shortDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// ── gráfico SVG ─────────────────────────────────────────────────────────────────
function LineChart({ points, color, decimals }: { points: Point[]; color: string; decimals: number }) {
  const W = 600, H = 190
  const padL = 44, padR = 16, padT = 16, padB = 26
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const values = points.map(p => p.value)
  let min = Math.min(...values)
  let max = Math.max(...values)
  if (min === max) { min -= 1; max += 1 }            // serie plana → margen artificial
  const range = max - min
  min -= range * 0.12
  max += range * 0.12

  const x = (i: number) => padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => padT + innerH - ((v - min) / (max - min)) * innerH

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ')
  const area = `${line} L ${x(points.length - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`

  // 3 marcas horizontales de referencia
  const ticks = [max - range * 0.12, (min + max) / 2, min + range * 0.12]
  const gradId = `grad-${color.replace('#', '')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }} role="img" aria-label="Gráfico de tendencia">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grilla + labels eje Y */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padL} y1={y(t)} x2={W - padR} y2={y(t)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2 3" />
          <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="ui-monospace, monospace">
            {fmt(t, decimals)}
          </text>
        </g>
      ))}

      {/* área + línea */}
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

      {/* puntos + labels eje X (primero y último) */}
      {points.map((p, i) => {
        const showDate = i === 0 || i === points.length - 1 || points.length <= 5
        return (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.value)} r="3" fill="#fff" stroke={color} strokeWidth="2" />
            {showDate && (
              <text x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} fontSize="10" fill="#9CA3AF" fontFamily="ui-monospace, monospace">
                {shortDate(p.date)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── componente principal ─────────────────────────────────────────────────────────
export function MetricTrendChart({ evolutions }: { evolutions: ClinicalEvolution[] }) {
  // series por métrica, ordenadas cronológicamente ascendente
  const series = useMemo(() => {
    const asc = [...evolutions].sort((a, b) => a.date.localeCompare(b.date))
    const out: Record<MetricKey, Point[]> = {} as any
    for (const m of METRICS) {
      out[m.key] = asc
        .filter(e => e[m.key] != null)
        .map(e => ({ date: e.date, value: Number(e[m.key]) }))
    }
    return out
  }, [evolutions])

  const available = METRICS.filter(m => series[m.key].length >= 2)
  const [selected, setSelected] = useState<MetricKey>('weightKg')

  // si no hay al menos una métrica con 2+ registros, no se puede graficar todavía
  if (available.length === 0) return null

  const metric = available.find(m => m.key === selected) ?? available[0]
  const points = series[metric.key]

  const first = points[0].value
  const last = points[points.length - 1].value
  const delta = last - first
  const deltaPct = first !== 0 ? (delta / first) * 100 : 0
  // en peso/grasa/cintura bajar es "bueno" (verde); en músculo subir es "bueno"
  const goodWhenUp = metric.key === 'muscleMassPercentage'
  const improving = goodWhenUp ? delta > 0 : delta < 0
  const neutral = Math.abs(delta) < 0.05

  return (
    <div className="bg-surface rounded-lg border border-border-base shadow-xs overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 gap-3 flex-wrap">
        {/* selector de métrica */}
        <div className="flex items-center gap-1 flex-wrap">
          {available.map(m => (
            <button
              key={m.key}
              onClick={() => setSelected(m.key)}
              className={clsx(
                'text-xs font-medium px-2.5 py-1 rounded-full border transition-colors',
                m.key === metric.key
                  ? 'border-transparent text-white'
                  : 'border-border-base text-text-muted hover:text-text-primary hover:border-border-strong',
              )}
              style={m.key === metric.key ? { backgroundColor: m.color } : undefined}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* valor actual + variación */}
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xl font-semibold text-text-primary tabular-nums">
            {fmt(last, metric.decimals)}
            <span className="text-sm text-text-muted ml-0.5">{metric.unit}</span>
          </span>
          {!neutral && (
            <span className={clsx('text-xs font-medium', improving ? 'text-success' : 'text-danger')}>
              {delta > 0 ? '▲' : '▼'} {fmt(Math.abs(delta), metric.decimals)}{metric.unit}
              <span className="text-text-disabled ml-1">({deltaPct > 0 ? '+' : ''}{deltaPct.toFixed(1)}%)</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-3 pb-2">
        <LineChart points={points} color={metric.color} decimals={metric.decimals} />
      </div>

      <p className="text-[11px] text-text-disabled px-5 pb-3">
        {metric.label} · {points.length} registros · desde {shortDate(points[0].date)}
      </p>
    </div>
  )
}
