import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { clsx } from 'clsx'
import { evolutionsService } from '@/services/clinicalEvolutions'
import type { ClinicalEvolution, CreateEvolutionRequest } from '@/types/clinicalEvolution'
import { Button } from '@/components/ui/Button'

// ── form ──────────────────────────────────────────────────────────────────────
type FormValues = {
  date: string
  weightKg: string
  heightCm: string
  waistCm: string
  hipCm: string
  armCm: string
  bodyFatPercentage: string
  muscleMassPercentage: string
  bloodPressureSystolic: string
  bloodPressureDiastolic: string
  clinicalNotes: string
  dietaryAssessment: string
  nextVisitObjectives: string
}

function toRequest(v: FormValues): CreateEvolutionRequest {
  return {
    date: v.date,
    weightKg: v.weightKg ? parseFloat(v.weightKg) : null,
    heightCm: v.heightCm ? parseFloat(v.heightCm) : null,
    waistCm: v.waistCm ? parseFloat(v.waistCm) : null,
    hipCm: v.hipCm ? parseFloat(v.hipCm) : null,
    armCm: v.armCm ? parseFloat(v.armCm) : null,
    bodyFatPercentage: v.bodyFatPercentage ? parseFloat(v.bodyFatPercentage) : null,
    muscleMassPercentage: v.muscleMassPercentage ? parseFloat(v.muscleMassPercentage) : null,
    bloodPressureSystolic: v.bloodPressureSystolic ? parseInt(v.bloodPressureSystolic) : null,
    bloodPressureDiastolic: v.bloodPressureDiastolic ? parseInt(v.bloodPressureDiastolic) : null,
    clinicalNotes: v.clinicalNotes || null,
    dietaryAssessment: v.dietaryAssessment || null,
    nextVisitObjectives: v.nextVisitObjectives || null,
  }
}

function evolutionToForm(e: ClinicalEvolution): FormValues {
  return {
    date: e.date,
    weightKg: e.weightKg?.toString() ?? '',
    heightCm: e.heightCm?.toString() ?? '',
    waistCm: e.waistCm?.toString() ?? '',
    hipCm: e.hipCm?.toString() ?? '',
    armCm: e.armCm?.toString() ?? '',
    bodyFatPercentage: e.bodyFatPercentage?.toString() ?? '',
    muscleMassPercentage: e.muscleMassPercentage?.toString() ?? '',
    bloodPressureSystolic: e.bloodPressureSystolic?.toString() ?? '',
    bloodPressureDiastolic: e.bloodPressureDiastolic?.toString() ?? '',
    clinicalNotes: e.clinicalNotes ?? '',
    dietaryAssessment: e.dietaryAssessment ?? '',
    nextVisitObjectives: e.nextVisitObjectives ?? '',
  }
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// ── form panel ────────────────────────────────────────────────────────────────
function EvolutionForm({
  patientId,
  editing,
  onClose,
}: {
  patientId: string
  editing: ClinicalEvolution | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: editing ? evolutionToForm(editing) : { date: today() },
  })

  const createMut = useMutation({
    mutationFn: (data: FormValues) => evolutionsService.create(patientId, toRequest(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolutions', patientId] })
      onClose()
    },
  })

  const updateMut = useMutation({
    mutationFn: (data: FormValues) => evolutionsService.update(patientId, editing!.id, toRequest(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolutions', patientId] })
      onClose()
    },
  })

  const mutation = editing ? updateMut : createMut
  const error = (mutation.error as any)?.response?.data?.title

  const NumField = ({ name, label, unit }: { name: keyof FormValues; label: string; unit: string }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      <div className="relative flex items-center">
        <input
          type="number"
          step="0.1"
          min="0"
          className="w-full h-8 rounded border border-border-base bg-surface text-sm text-text-primary pl-2.5 pr-8 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors"
          {...register(name)}
        />
        <span className="absolute right-2 text-xs text-text-disabled">{unit}</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/20" onClick={onClose} />
      <div className="w-[480px] bg-surface shadow-lg flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
          <h2 className="text-md font-semibold text-text-primary">
            {editing ? 'Editar evolución' : 'Nueva evolución'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-subtle text-text-muted hover:text-text-primary transition-colors">
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="px-3 py-2 rounded bg-danger-light border border-danger-border text-sm text-danger">{error}</div>
          )}

          {/* fecha */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Fecha de consulta *</label>
            <input type="date" className="h-9 rounded border border-border-base bg-surface text-sm text-text-primary px-3 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors" {...register('date', { required: true })} />
          </div>

          {/* medidas */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Medidas antropométricas</h3>
            <div className="grid grid-cols-3 gap-3">
              <NumField name="weightKg" label="Peso" unit="kg" />
              <NumField name="heightCm" label="Talla" unit="cm" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-muted">IMC</label>
                <div className="h-8 rounded border border-border-subtle bg-subtle text-sm text-text-muted px-2.5 flex items-center">
                  auto
                </div>
              </div>
              <NumField name="waistCm" label="Cintura" unit="cm" />
              <NumField name="hipCm" label="Cadera" unit="cm" />
              <NumField name="armCm" label="Brazo" unit="cm" />
              <NumField name="bodyFatPercentage" label="% Grasa" unit="%" />
              <NumField name="muscleMassPercentage" label="% Músculo" unit="%" />
            </div>
          </div>

          {/* TA */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Presión arterial</h3>
            <div className="grid grid-cols-2 gap-3">
              <NumField name="bloodPressureSystolic" label="Sistólica" unit="mmHg" />
              <NumField name="bloodPressureDiastolic" label="Diastólica" unit="mmHg" />
            </div>
          </div>

          {/* notas */}
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Notas clínicas</h3>
            <div className="space-y-3">
              {([
                ['clinicalNotes', 'Notas de la consulta', 'Evolución, observaciones, motivo de la visita...'],
                ['dietaryAssessment', 'Evaluación dietética', 'Adherencia al plan, registro alimentario, análisis...'],
                ['nextVisitObjectives', 'Objetivos para próxima consulta', 'Metas a alcanzar antes del próximo turno...'],
              ] as const).map(([field, label, placeholder]) => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-primary">{label}</label>
                  <textarea rows={3} className="w-full rounded border border-border-base bg-surface text-sm text-text-primary px-3 py-2 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors resize-none" placeholder={placeholder} {...register(field)} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={mutation.isPending}>
              {editing ? 'Guardar cambios' : 'Registrar evolución'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── evolution card ────────────────────────────────────────────────────────────
function EvolutionCard({
  evolution,
  onEdit,
  onDelete,
}: {
  evolution: ClinicalEvolution
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  const date = new Date(evolution.date + 'T00:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const metrics = [
    { label: 'Peso', value: evolution.weightKg, unit: 'kg' },
    { label: 'IMC', value: evolution.bmi, unit: '' },
    { label: 'Cintura', value: evolution.waistCm, unit: 'cm' },
    { label: 'Cadera', value: evolution.hipCm, unit: 'cm' },
    { label: '% Grasa', value: evolution.bodyFatPercentage, unit: '%' },
    { label: '% Músculo', value: evolution.muscleMassPercentage, unit: '%' },
  ].filter(m => m.value != null)

  return (
    <div className="bg-surface rounded-lg border border-border-base shadow-xs overflow-hidden">
      {/* header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-subtle transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-text-primary capitalize">{date}</p>
            {metrics.length > 0 && (
              <p className="text-xs text-text-muted mt-0.5">
                {metrics.slice(0, 3).map(m => `${m.label}: ${m.value}${m.unit}`).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="p-1.5 rounded hover:bg-base text-text-muted hover:text-text-primary transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11.5 2.5a1.5 1.5 0 0 1 2 2L5 13H2v-3L11.5 2.5z" /></svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            className="p-1.5 rounded hover:bg-danger-light text-text-muted hover:text-danger transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" /></svg>
          </button>
          <svg viewBox="0 0 16 16" className={clsx('w-4 h-4 text-text-muted transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6l4 4 4-4" /></svg>
        </div>
      </div>

      {/* body */}
      {open && (
        <div className="border-t border-border-subtle px-5 py-4 space-y-4">
          {metrics.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Medidas</p>
              <div className="grid grid-cols-3 gap-3">
                {metrics.map(m => (
                  <div key={m.label} className="bg-subtle rounded p-2.5">
                    <p className="text-xs text-text-muted">{m.label}</p>
                    <p className="text-base font-semibold text-text-primary font-mono">
                      {m.value}{m.unit}
                    </p>
                  </div>
                ))}
                {evolution.bloodPressureSystolic && (
                  <div className="bg-subtle rounded p-2.5">
                    <p className="text-xs text-text-muted">TA</p>
                    <p className="text-base font-semibold text-text-primary font-mono">
                      {evolution.bloodPressureSystolic}/{evolution.bloodPressureDiastolic}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {evolution.clinicalNotes && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Notas clínicas</p>
              <p className="text-sm text-text-secondary whitespace-pre-line">{evolution.clinicalNotes}</p>
            </div>
          )}

          {evolution.dietaryAssessment && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Evaluación dietética</p>
              <p className="text-sm text-text-secondary whitespace-pre-line">{evolution.dietaryAssessment}</p>
            </div>
          )}

          {evolution.nextVisitObjectives && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Objetivos para próxima consulta</p>
              <p className="text-sm text-text-secondary whitespace-pre-line">{evolution.nextVisitObjectives}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── main ──────────────────────────────────────────────────────────────────────
export function EvolutionsTab({ patientId }: { patientId: string }) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingEvolution, setEditingEvolution] = useState<ClinicalEvolution | null>(null)
  const queryClient = useQueryClient()

  const { data: evolutions = [], isLoading } = useQuery({
    queryKey: ['evolutions', patientId],
    queryFn: () => evolutionsService.list(patientId),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => evolutionsService.delete(patientId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['evolutions', patientId] }),
  })

  const handleEdit = (e: ClinicalEvolution) => {
    setEditingEvolution(e)
    setFormOpen(true)
  }

  const handleDelete = (e: ClinicalEvolution) => {
    if (confirm(`¿Eliminar la evolución del ${new Date(e.date + 'T00:00:00').toLocaleDateString('es-AR')}?`)) {
      deleteMut.mutate(e.id)
    }
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingEvolution(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Evoluciones clínicas</h2>
          {evolutions.length > 0 && (
            <p className="text-xs text-text-muted mt-0.5">{evolutions.length} {evolutions.length === 1 ? 'consulta registrada' : 'consultas registradas'}</p>
          )}
        </div>
        <Button size="sm" onClick={() => { setEditingEvolution(null); setFormOpen(true) }}>
          Nueva evolución
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-text-muted text-sm">
          <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando evoluciones...
        </div>
      )}

      {!isLoading && evolutions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted border border-dashed border-border-base rounded-lg">
          <svg viewBox="0 0 24 24" className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-sm font-medium">Sin evoluciones registradas</p>
          <p className="text-xs mt-1">Registrá la primera consulta clínica</p>
        </div>
      )}

      {!isLoading && evolutions.length > 0 && (
        <div className="space-y-3">
          {evolutions.map(e => (
            <EvolutionCard
              key={e.id}
              evolution={e}
              onEdit={() => handleEdit(e)}
              onDelete={() => handleDelete(e)}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <EvolutionForm
          patientId={patientId}
          editing={editingEvolution}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
