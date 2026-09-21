import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { clsx } from 'clsx'
import { useAuthStore } from '@/store/authStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Icons } from '@/components/ui/Icons'

// ─── Types ─────────────────────────────────────────────────

type VisitStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'

interface MockVisit {
  id: string
  time: string
  patientName: string
  status: VisitStatus
  isNew: boolean
}

interface NewPatient {
  id: string
  name: string
  dni: string
  since: string
}

// ─── Mock data ──────────────────────────────────────────────

const MOCK_VISITS: MockVisit[] = [
  { id: '1', time: '09:00', patientName: 'María González',   status: 'COMPLETED', isNew: false },
  { id: '2', time: '09:45', patientName: 'Facundo Peralta',  status: 'COMPLETED', isNew: false },
  { id: '3', time: '10:30', patientName: 'Valentina Ruiz',   status: 'CONFIRMED', isNew: true  },
  { id: '4', time: '11:15', patientName: 'Diego Fernández',  status: 'CONFIRMED', isNew: false },
  { id: '5', time: '12:00', patientName: 'Lucía Morales',    status: 'SCHEDULED', isNew: false },
  { id: '6', time: '14:30', patientName: 'Santiago López',   status: 'SCHEDULED', isNew: false },
  { id: '7', time: '15:15', patientName: 'Florencia Gómez',  status: 'CONFIRMED', isNew: true  },
]

const MOCK_NEW_PATIENTS: NewPatient[] = [
  { id: '1', name: 'Valentina Ruiz',  dni: '41.234.567', since: 'Hoy' },
  { id: '2', name: 'Florencia Gómez', dni: '38.901.234', since: 'Hoy' },
  { id: '3', name: 'Martín Acosta',   dni: '35.678.012', since: 'Ayer' },
]

const MOCK_STATS = {
  totalPatients:      247,
  newPatientsWeek:    3,
  todayVisits:        7,
  confirmedVisits:    3,
  monthlyCollected:   185400,
  monthlyPending:     23200,
  monthlyOverdue:     8400,
}

// ─── Helpers ────────────────────────────────────────────────

function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const VISIT_BADGE: Record<VisitStatus, { variant: 'default' | 'primary' | 'success' | 'danger'; label: string }> = {
  SCHEDULED: { variant: 'default',  label: 'Programado' },
  CONFIRMED: { variant: 'primary',  label: 'Confirmado' },
  COMPLETED: { variant: 'success',  label: 'Atendido'   },
  CANCELED:  { variant: 'danger',   label: 'Cancelado'  },
}

// ─── Sub-components ─────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  subDanger,
}: {
  label: string
  value: string
  sub: string
  subDanger?: boolean
}) {
  return (
    <div className="bg-surface rounded border border-border-base p-5 shadow-xs">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
      <p className="font-mono text-3xl font-semibold text-text-primary mt-1.5 leading-none">
        {value}
      </p>
      <p className={clsx('text-xs mt-1.5', subDanger ? 'text-danger' : 'text-text-muted')}>
        {sub}
      </p>
    </div>
  )
}

function VisitRow({ visit }: { visit: MockVisit }) {
  const badge = VISIT_BADGE[visit.status]
  return (
    <div className="flex items-center gap-3 py-3 px-3 -mx-3 rounded hover:bg-primary-50 group transition-colors cursor-pointer">
      <span className="font-mono text-sm text-text-muted w-11 flex-shrink-0 tabular-nums">
        {visit.time}
      </span>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary truncate">
          {visit.patientName}
        </span>
        {visit.isNew && (
          <Badge variant="accent" className="text-[10px] px-1.5 py-0 flex-shrink-0">nuevo</Badge>
        )}
      </div>
      <Badge variant={badge.variant} dot className="flex-shrink-0">
        {badge.label}
      </Badge>
      <Icons.ChevronRight className="w-4 h-4 text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────

export function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const today = new Date()
  const dateStr = format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  const capitalDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1)

  const totalPending = MOCK_STATS.monthlyPending + MOCK_STATS.monthlyOverdue

  return (
    <div>
      {/* ── Header ───────────────────────────── */}
      <div className="mb-8">
        <p
          className="text-text-muted mb-0.5"
          style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 22, lineHeight: 1.3 }}
        >
          {capitalDate}
        </p>
        <h1 className="text-2xl font-semibold text-text-primary">
          {getGreeting()}, {user?.first_name || 'bienvenido'}
        </h1>
      </div>

      {/* ── Stat strip ───────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pacientes activos"
          value={MOCK_STATS.totalPatients.toString()}
          sub={`+${MOCK_STATS.newPatientsWeek} esta semana`}
        />
        <StatCard
          label="Turnos hoy"
          value={MOCK_STATS.todayVisits.toString()}
          sub={`${MOCK_STATS.confirmedVisits} confirmados`}
        />
        <StatCard
          label="Cobrado en junio"
          value={formatARS(MOCK_STATS.monthlyCollected)}
          sub="vs $ 162.000 en mayo"
        />
        <StatCard
          label="Pendiente de cobro"
          value={formatARS(totalPending)}
          sub={`${formatARS(MOCK_STATS.monthlyOverdue)} vencido`}
          subDanger
        />
      </div>

      {/* ── Main content ─────────────────────── */}
      <div className="grid grid-cols-3 gap-6">

        {/* Agenda del día */}
        <div className="col-span-2">
          <Card padding="none">
            <div className="px-5 pt-5 pb-4 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agenda del día</CardTitle>
                  <p className="text-sm text-text-muted mt-0.5">
                    {MOCK_STATS.todayVisits} turnos · {MOCK_STATS.confirmedVisits} confirmados
                  </p>
                </div>
                <button className="text-sm text-primary-700 font-medium hover:underline">
                  Ver todos →
                </button>
              </div>
            </div>
            <div className="px-5 py-2 divide-y divide-border-subtle">
              {MOCK_VISITS.map(v => (
                <VisitRow key={v.id} visit={v} />
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="col-span-1 flex flex-col gap-4">

          {/* New patients */}
          <Card padding="none">
            <div className="px-4 pt-4 pb-3 border-b border-border-subtle flex items-center justify-between">
              <CardTitle className="text-base">Pacientes nuevos</CardTitle>
              <Badge variant="accent">{MOCK_NEW_PATIENTS.length}</Badge>
            </div>
            <div className="divide-y divide-border-subtle">
              {MOCK_NEW_PATIENTS.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-primary-50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    <p className="text-xs text-text-muted font-mono">{p.dni}</p>
                  </div>
                  <span className="text-xs text-text-disabled ml-2 flex-shrink-0">{p.since}</span>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border-subtle">
              <button className="text-sm text-primary-700 font-medium hover:underline">
                Ver todos los pacientes →
              </button>
            </div>
          </Card>

          {/* Financial summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen — junio</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Cobrado</span>
                <span className="font-mono text-sm font-semibold text-success">
                  {formatARS(MOCK_STATS.monthlyCollected)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Pendiente</span>
                <span className="font-mono text-sm font-semibold text-warning">
                  {formatARS(MOCK_STATS.monthlyPending)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Vencido</span>
                <span className="font-mono text-sm font-semibold text-danger">
                  {formatARS(MOCK_STATS.monthlyOverdue)}
                </span>
              </div>

              {/* Collection rate bar */}
              <div className="pt-1">
                <div className="flex justify-between text-xs text-text-muted mb-1.5">
                  <span>Tasa de cobro</span>
                  <span>
                    {Math.round(
                      (MOCK_STATS.monthlyCollected /
                        (MOCK_STATS.monthlyCollected + totalPending)) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(
                        (MOCK_STATS.monthlyCollected /
                          (MOCK_STATS.monthlyCollected + totalPending)) *
                          100
                      )}%`,
                      background: '#3DAA7F',
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
