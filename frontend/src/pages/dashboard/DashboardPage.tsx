import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { dashboardService, type DashboardVisit, type DashboardNewPatient } from '@/services/dashboard'

// ─── Helpers ────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const VISIT_BADGE: Record<DashboardVisit['status'], { variant: 'default' | 'primary' | 'success' | 'danger' | 'warning'; label: string }> = {
  SCHEDULED: { variant: 'primary', label: 'Programado' },
  COMPLETED: { variant: 'success', label: 'Atendido' },
  CANCELLED: { variant: 'danger',  label: 'Cancelado' },
  NO_SHOW:   { variant: 'warning', label: 'No asistió' },
}

function since(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  return format(d, "d MMM", { locale: es })
}

// ─── Sub-components ─────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface rounded border border-border-base p-5 shadow-xs">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="font-mono text-3xl font-semibold text-text-primary mt-1.5 leading-none">{value}</p>
      {sub && <p className="text-xs mt-1.5 text-text-muted">{sub}</p>}
    </div>
  )
}

function VisitRow({ visit }: { visit: DashboardVisit }) {
  const badge = VISIT_BADGE[visit.status]
  return (
    <div className="flex items-center gap-3 py-3 px-3 -mx-3 rounded hover:bg-primary-50 transition-colors">
      <span className="font-mono text-sm text-text-muted w-11 flex-shrink-0 tabular-nums">
        {format(new Date(visit.scheduled_at), 'HH:mm')}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary truncate">{visit.patient_name}</span>
        {visit.is_new && (
          <Badge variant="accent" className="text-[10px] px-1.5 py-0 flex-shrink-0">nuevo</Badge>
        )}
      </div>
      <Badge variant={badge.variant} dot className="flex-shrink-0">{badge.label}</Badge>
    </div>
  )
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-text-muted px-3 py-8 text-center">{children}</p>
}

// ─── Page ───────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const today = new Date()
  const dateStr = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  const capitalDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get })

  const visits: DashboardVisit[] = data?.visits_today ?? []
  const newPatients: DashboardNewPatient[] = data?.new_patients ?? []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-text-muted mb-0.5" style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 22, lineHeight: 1.3 }}>
          {capitalDate}
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          {getGreeting()}, {user?.first_name || 'bienvenido'}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Pacientes activos" value={isLoading ? '—' : String(data?.patients_active ?? 0)} />
        <StatCard label="Turnos hoy" value={isLoading ? '—' : String(visits.length)} />
        <StatCard label="Pacientes nuevos" value={isLoading ? '—' : String(data?.patients_new_count ?? 0)} />
      </div>

      {/* Main */}
      <div className="grid grid-cols-3 gap-6">
        {/* Agenda del día */}
        <div className="col-span-2">
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-border-subtle flex items-center justify-between">
              <div>
                <CardTitle>Agenda del día</CardTitle>
                <p className="text-sm text-text-muted mt-0.5">{visits.length} turnos</p>
              </div>
              <Link to="/agenda" className="text-sm text-primary-700 font-medium hover:underline">Ver agenda →</Link>
            </div>
            <div className="px-5 py-2 divide-y divide-border-subtle">
              {isLoading ? (
                <EmptyState>Cargando…</EmptyState>
              ) : visits.length === 0 ? (
                <EmptyState>No hay turnos para hoy.</EmptyState>
              ) : (
                visits.map(v => <VisitRow key={v.id} visit={v} />)
              )}
            </div>
          </Card>
        </div>

        {/* Pacientes nuevos */}
        <div className="col-span-1">
          <Card padding="none">
            <div className="px-4 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between">
              <CardTitle className="text-base">Pacientes nuevos</CardTitle>
              <Badge variant="accent">{newPatients.length}</Badge>
            </div>
            <div className="divide-y divide-border-subtle">
              {isLoading ? (
                <EmptyState>Cargando…</EmptyState>
              ) : newPatients.length === 0 ? (
                <EmptyState>Sin pacientes nuevos.</EmptyState>
              ) : (
                newPatients.map(p => (
                  <Link
                    key={p.id}
                    to={`/pacientes/${p.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-primary-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                      {p.dni && <p className="text-xs text-text-muted font-mono">{p.dni}</p>}
                    </div>
                    <span className="text-xs text-text-disabled ml-2 flex-shrink-0">{since(p.created_at)}</span>
                  </Link>
                ))
              )}
            </div>
            <div className="px-4 py-3 border-t border-border-subtle">
              <Link to="/pacientes" className="text-sm text-primary-700 font-medium hover:underline">
                Ver todos los pacientes →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <p className="text-xs text-text-disabled mt-6">
        Los indicadores de cobros llegan con el módulo de pagos.
      </p>
    </div>
  )
}
