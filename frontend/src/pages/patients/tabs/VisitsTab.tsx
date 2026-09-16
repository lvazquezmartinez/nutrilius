import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { visitsService } from '@/services/visits'
import type { Visit } from '@/types/visit'
import { Button } from '@/components/ui/Button'

type FormValues = {
  scheduledAt: string
  durationMinutes: string
  reason: string
  notes: string
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  Scheduled: { label: 'Programado', className: 'bg-accent-100 text-accent-700 border-accent-200' },
  Completed: { label: 'Completado', className: 'bg-success-light text-success border-success-border' },
  Cancelled: { label: 'Cancelado', className: 'bg-subtle text-text-muted border-border-base' },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function toLocalDatetimeInput(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function VisitCard({
  visit,
  patientId,
  onEdit,
}: {
  visit: Visit
  patientId: string
  onEdit: (v: Visit) => void
}) {
  const queryClient = useQueryClient()
  const st = STATUS_LABEL[visit.status]

  const cancelMutation = useMutation({
    mutationFn: () => visitsService.cancel(patientId, visit.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visits', patientId] }),
  })

  const completeMutation = useMutation({
    mutationFn: () => visitsService.complete(patientId, visit.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['visits', patientId] }),
  })

  return (
    <div className="bg-surface border border-border-base rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-primary">{formatDateTime(visit.scheduledAt)}</span>
            {visit.durationMinutes && (
              <span className="text-xs text-text-muted">{visit.durationMinutes} min</span>
            )}
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-xs text-xs font-medium border ${st.className}`}>
              {st.label}
            </span>
          </div>
          {visit.reason && (
            <p className="text-sm text-text-secondary mt-1">{visit.reason}</p>
          )}
          {visit.notes && (
            <p className="text-xs text-text-muted mt-1 whitespace-pre-line">{visit.notes}</p>
          )}
        </div>

        {visit.status === 'Scheduled' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(visit)}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="text-xs text-success hover:opacity-75 transition-opacity"
            >
              Completar
            </button>
            <button
              onClick={() => {
                if (confirm('¿Cancelar este turno?')) cancelMutation.mutate()
              }}
              disabled={cancelMutation.isPending}
              className="text-xs text-danger hover:opacity-75 transition-opacity"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function VisitForm({
  patientId,
  editing,
  onClose,
}: {
  patientId: string
  editing: Visit | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const defaultValues: FormValues = editing
    ? {
        scheduledAt: toLocalDatetimeInput(editing.scheduledAt),
        durationMinutes: editing.durationMinutes?.toString() ?? '',
        reason: editing.reason ?? '',
        notes: editing.notes ?? '',
      }
    : { scheduledAt: '', durationMinutes: '45', reason: '', notes: '' }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ defaultValues })

  const createMutation = useMutation({
    mutationFn: (v: FormValues) =>
      visitsService.create(patientId, {
        scheduledAt: new Date(v.scheduledAt).toISOString(),
        durationMinutes: v.durationMinutes ? parseInt(v.durationMinutes) : undefined,
        reason: v.reason || undefined,
        notes: v.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', patientId] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (v: FormValues) =>
      visitsService.update(patientId, editing!.id, {
        scheduledAt: new Date(v.scheduledAt).toISOString(),
        durationMinutes: v.durationMinutes ? parseInt(v.durationMinutes) : undefined,
        reason: v.reason || undefined,
        notes: v.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits', patientId] })
      onClose()
    },
  })

  const onSubmit = (v: FormValues) =>
    editing ? updateMutation.mutateAsync(v) : createMutation.mutateAsync(v)

  const error = createMutation.error ?? updateMutation.error

  return (
    <div className="bg-surface border border-border-base rounded-lg p-5 mb-4">
      <h3 className="text-sm font-semibold text-text-primary mb-4">
        {editing ? 'Editar turno' : 'Nuevo turno'}
      </h3>

      {error && (
        <div className="mb-3 px-3 py-2 rounded border text-xs"
          style={{ background: '#FBEAEA', borderColor: '#E8A0A0', color: '#C0392B' }}>
          No se pudo guardar el turno.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Fecha y hora *</label>
            <input
              type="datetime-local"
              className="w-full text-sm border border-border-base rounded-sm px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300"
              {...register('scheduledAt', { required: true })}
            />
            {errors.scheduledAt && <p className="text-xs text-danger mt-1">Requerido</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Duración (min)</label>
            <input
              type="number"
              min={1}
              className="w-full text-sm border border-border-base rounded-sm px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300"
              {...register('durationMinutes')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Motivo</label>
          <input
            type="text"
            placeholder="Motivo de la consulta"
            className="w-full text-sm border border-border-base rounded-sm px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300"
            {...register('reason')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Notas</label>
          <textarea
            rows={3}
            className="w-full text-sm border border-border-base rounded-sm px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            {...register('notes')}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            {editing ? 'Guardar cambios' : 'Crear turno'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export function VisitsTab({ patientId }: { patientId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Visit | null>(null)

  const { data: visits, isLoading, isError } = useQuery({
    queryKey: ['visits', patientId],
    queryFn: () => visitsService.listByPatient(patientId),
  })

  const handleEdit = (v: Visit) => {
    setEditing(v)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditing(null)
  }

  if (isLoading) {
    return <p className="text-sm text-text-muted py-4">Cargando turnos...</p>
  }

  if (isError) {
    return <p className="text-sm text-danger py-4">No se pudieron cargar los turnos.</p>
  }

  const scheduled = visits?.filter(v => v.status === 'Scheduled') ?? []
  const past = visits?.filter(v => v.status !== 'Scheduled') ?? []

  return (
    <div className="space-y-4">
      {!showForm && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm(true)}>+ Nuevo turno</Button>
        </div>
      )}

      {showForm && (
        <VisitForm patientId={patientId} editing={editing} onClose={handleClose} />
      )}

      {visits?.length === 0 && !showForm && (
        <div className="py-10 text-center text-sm text-text-muted border border-dashed border-border-base rounded-lg">
          No hay turnos registrados para este paciente.
        </div>
      )}

      {scheduled.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Próximos</h3>
          <div className="space-y-2">
            {scheduled.map(v => (
              <VisitCard key={v.id} visit={v} patientId={patientId} onEdit={handleEdit} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Historial</h3>
          <div className="space-y-2">
            {past.map(v => (
              <VisitCard key={v.id} visit={v} patientId={patientId} onEdit={handleEdit} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
