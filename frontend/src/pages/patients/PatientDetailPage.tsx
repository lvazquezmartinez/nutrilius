import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { patientsService } from '@/services/patients'
import { Button } from '@/components/ui/Button'
import { AnamnesisTab } from './tabs/AnamnesisTab'
import { EvolutionsTab } from './tabs/EvolutionsTab'
import { VisitsTab } from './tabs/VisitsTab'

type Tab = 'datos' | 'anamnesis' | 'evoluciones' | 'visitas'

const SEX_LABELS: Record<string, string> = {
  Male: 'Masculino', Female: 'Femenino', Other: 'Otro',
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-text-primary">{value ?? '—'}</dd>
    </div>
  )
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('datos')

  const { data: patient, isLoading, isError } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsService.getById(id!),
    enabled: Boolean(id),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => patientsService.deactivate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] })
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: () => patientsService.reactivate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] })
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-muted">
        <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando...
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="px-8 py-12 text-center text-danger text-sm">
        No se pudo cargar el paciente.
        <button className="ml-2 underline" onClick={() => navigate('/pacientes')}>Volver</button>
      </div>
    )
  }

  const isActive = patient.status === 'Active'

  return (
    <div className="flex flex-col h-full">
      {/* top bar */}
      <div className="px-8 pt-7 pb-0 border-b border-border-base">
        <button
          onClick={() => navigate('/pacientes')}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-5 transition-colors"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 3L6 8l4 5" />
          </svg>
          Pacientes
        </button>

        {/* patient header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-md bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-primary-700">
                {patient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-text-primary">{patient.fullName}</h1>
                {patient.isNew && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-xs font-medium bg-accent-100 text-accent-700 border border-accent-200">Nuevo</span>
                )}
                <span className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-medium',
                  isActive
                    ? 'bg-success-light text-success border border-success-border'
                    : 'bg-subtle text-text-muted border border-border-base'
                )}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-sm text-text-muted mt-0.5">
                {[patient.dni ? `DNI ${patient.dni}` : null, patient.email, patient.age ? `${patient.age} años` : null]
                  .filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isActive ? (
              <Button
                variant="secondary"
                size="sm"
                loading={deactivateMutation.isPending}
                onClick={() => {
                  if (confirm(`¿Desactivar a ${patient.fullName}?`))
                    deactivateMutation.mutate()
                }}
              >
                Desactivar
              </Button>
            ) : (
              <Button
                variant="accent"
                size="sm"
                loading={reactivateMutation.isPending}
                onClick={() => reactivateMutation.mutate()}
              >
                Reactivar
              </Button>
            )}
          </div>
        </div>

        {/* tabs */}
        <div className="flex items-center gap-0 -mb-px">
          {([
            { key: 'datos',       label: 'Datos' },
            { key: 'anamnesis',   label: 'Anamnesis' },
            { key: 'evoluciones', label: 'Evoluciones' },
            { key: 'visitas',     label: 'Turnos' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-fast',
                tab === t.key
                  ? 'border-b-primary-700 text-primary-700'
                  : 'border-b-transparent text-text-muted hover:text-text-primary hover:border-b-border-strong'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* tab content */}
      <div className="flex-1 overflow-auto px-8 py-7">
        {tab === 'datos' && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-surface rounded-lg border border-border-base shadow-xs overflow-hidden">
              <div className="px-6 py-3.5 border-b border-border-base bg-subtle">
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Información personal</h2>
              </div>
              <dl className="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
                <DetailField label="DNI" value={patient.dni} />
                <DetailField label="Sexo" value={patient.sex ? SEX_LABELS[patient.sex] : null} />
                <DetailField label="Fecha de nacimiento" value={
                  patient.dateOfBirth
                    ? new Date(patient.dateOfBirth + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : null
                } />
                <DetailField label="Edad" value={patient.age != null ? `${patient.age} años` : null} />
                <DetailField label="Teléfono" value={patient.phone} />
                <DetailField label="Email" value={patient.email} />
              </dl>

              {patient.notes && (
                <div className="border-t border-border-base px-6 py-4">
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Notas</h3>
                  <p className="text-sm text-text-secondary whitespace-pre-line">{patient.notes}</p>
                </div>
              )}

              <div className="border-t border-border-base px-6 py-3 bg-subtle flex items-center gap-6 text-xs text-text-muted">
                <span>Alta: {new Date(patient.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                {patient.updatedAt && (
                  <span>Modificado: {new Date(patient.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
                {!isActive && patient.deactivatedAt && (
                  <span className="text-danger">
                    Desactivado: {new Date(patient.deactivatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'anamnesis' && id && (
          <div className="max-w-2xl">
            <AnamnesisTab patientId={id} />
          </div>
        )}

        {tab === 'evoluciones' && id && (
          <div className="max-w-3xl">
            <EvolutionsTab patientId={id} />
          </div>
        )}

        {tab === 'visitas' && id && (
          <div className="max-w-2xl">
            <VisitsTab patientId={id} />
          </div>
        )}
      </div>
    </div>
  )
}
