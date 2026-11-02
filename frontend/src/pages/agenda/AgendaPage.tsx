import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, startOfWeek, addDays, addWeeks, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { agendaService, type AgendaVisit } from '@/services/agenda'

const STATUS: Record<AgendaVisit['status'], { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'Programado', color: '#1d4ed8', bg: '#eaf1fb' },
  COMPLETED: { label: 'Atendido', color: '#2f7d5c', bg: '#e9f6f0' },
  CANCELLED: { label: 'Cancelado', color: '#C4463A', bg: '#fbeaea' },
  NO_SHOW:   { label: 'No asistió', color: '#B45309', bg: '#fff4e5' },
}

export function AgendaPage() {
  const [view, setView] = useState<'agenda' | 'inactivos'>('agenda')
  const [weekOffset, setWeekOffset] = useState(0)
  const [days, setDays] = useState(60)

  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  const { data: visits = [], isLoading } = useQuery({
    queryKey: ['agenda', weekStart.toISOString()],
    queryFn: () => agendaService.range(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')),
    enabled: view === 'agenda',
  })
  const { data: inactive } = useQuery({
    queryKey: ['inactive', days], queryFn: () => agendaService.inactive(days), enabled: view === 'inactivos',
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-semibold text-text-primary">Agenda</h1>
        <div className="flex gap-1 bg-subtle rounded-lg p-1">
          {(['agenda', 'inactivos'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="text-sm font-medium px-3 py-1 rounded-md"
              style={view === v ? { background: '#fff', color: '#1E4D6B' } : { color: '#64748b' }}>
              {v === 'agenda' ? 'Semana' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {view === 'agenda' && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <button className="text-sm px-2 py-1 rounded border border-border-base" onClick={() => setWeekOffset(w => w - 1)}>←</button>
            <span className="text-sm font-medium text-text-primary capitalize">
              {format(weekStart, "d 'de' MMM", { locale: es })} – {format(weekEnd, "d 'de' MMM yyyy", { locale: es })}
            </span>
            <button className="text-sm px-2 py-1 rounded border border-border-base" onClick={() => setWeekOffset(w => w + 1)}>→</button>
            <button className="text-xs text-primary-700 ml-1" onClick={() => setWeekOffset(0)}>Hoy</button>
          </div>

          {isLoading ? <p className="text-sm text-text-muted py-10 text-center">Cargando…</p> : (
            <div className="grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map(day => {
                const dayVisits = visits.filter(v => isSameDay(parseISO(v.scheduled_at), day))
                  .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
                const today = isSameDay(day, new Date())
                return (
                  <div key={day.toISOString()} className="bg-surface rounded-lg border border-border-base min-h-[140px]"
                       style={today ? { borderColor: '#3DAA7F' } : undefined}>
                    <div className="px-2 py-1.5 border-b border-border-subtle text-center">
                      <div className="text-[11px] uppercase text-text-muted">{format(day, 'EEE', { locale: es })}</div>
                      <div className="text-sm font-semibold" style={today ? { color: '#2f7d5c' } : {}}>{format(day, 'd')}</div>
                    </div>
                    <div className="p-1.5 space-y-1">
                      {dayVisits.map(v => {
                        const s = STATUS[v.status]
                        return (
                          <Link key={v.id} to={`/pacientes/${v.patient}`}
                            className="block rounded px-1.5 py-1 text-[11px]" style={{ background: s.bg }}>
                            <span className="font-mono" style={{ color: s.color }}>{format(parseISO(v.scheduled_at), 'HH:mm')}</span>
                            <span className="text-text-primary ml-1 truncate">{v.patient_name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {view === 'inactivos' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-text-muted">Sin turnos hace más de</span>
            <select className="h-8 rounded border border-border-base text-sm px-2" value={days}
                    onChange={e => setDays(Number(e.target.value))}>
              {[30, 60, 90, 120].map(d => <option key={d} value={d}>{d} días</option>)}
            </select>
            {inactive && <span className="text-sm text-text-muted">· {inactive.count} paciente(s)</span>}
          </div>
          <div className="bg-surface rounded-lg border border-border-base divide-y divide-border-subtle">
            {inactive?.patients.length
              ? inactive.patients.map(p => (
                  <Link key={p.id} to={`/pacientes/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-subtle">
                    <div>
                      <span className="text-sm font-medium text-text-primary">{p.name}</span>
                      {p.dni && <span className="text-xs text-text-muted ml-2 font-mono">{p.dni}</span>}
                    </div>
                    <span className="text-xs text-text-muted">
                      último turno: {p.last_visit ? format(parseISO(p.last_visit), "d MMM yyyy", { locale: es }) : '—'}
                    </span>
                  </Link>
                ))
              : <p className="text-sm text-text-muted px-5 py-8 text-center">Sin pacientes inactivos en este período.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
