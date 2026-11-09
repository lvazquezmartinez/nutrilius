import { useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { plansService, consentService } from '@/services/plans'
import type { NutritionPlan, PlanContent, PlanGoal, ActivityLevel, PlanStatus } from '@/types/plan'

const GOALS: { value: PlanGoal; label: string }[] = [
  { value: 'DESCENSO', label: 'Descenso de peso' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'AUMENTO', label: 'Aumento de masa' },
]
const ACTIVITIES: { value: ActivityLevel; label: string }[] = [
  { value: 'SEDENTARY', label: 'Sedentario' },
  { value: 'LIGHT', label: 'Ligero' },
  { value: 'MODERATE', label: 'Moderado' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'VERY_ACTIVE', label: 'Muy activo' },
]
const SLOTS = ['desayuno', 'colacion', 'almuerzo', 'merienda', 'cena']
const SLOT_LABEL: Record<string, string> = {
  desayuno: 'Desayuno', colacion: 'Colación', almuerzo: 'Almuerzo', merienda: 'Merienda', cena: 'Cena',
}

const STATUS_BADGE: Record<PlanStatus, { bg: string; color: string; border: string; label: string }> = {
  BORRADOR_IA: { bg: '#fff4e5', color: '#B45309', border: '#f4d9ae', label: 'Borrador IA' },
  EN_REVISION: { bg: '#eaf1fb', color: '#1d4ed8', border: '#c3d6f4', label: 'En revisión' },
  APROBADO:    { bg: '#e9f6f0', color: '#2f7d5c', border: '#b9e3d0', label: 'Aprobado' },
  COMPARTIDO:  { bg: '#e9f6f0', color: '#2f7d5c', border: '#b9e3d0', label: 'Compartido' },
}

function StatusBadge({ status }: { status: PlanStatus }) {
  const s = STATUS_BADGE[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />{s.label}
    </span>
  )
}

export function PlanTab({ patientId }: { patientId: string }) {
  const qc = useQueryClient()
  const [goal, setGoal] = useState<PlanGoal>('DESCENSO')
  const [activity, setActivity] = useState<ActivityLevel>('MODERATE')
  // Plan seleccionado del historial; null = "Nuevo plan" (aún sin crear).
  const [selectedId, setSelectedId] = useState<number | 'new' | null>(null)

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['plans', patientId], queryFn: () => plansService.listByPatient(patientId),
  })
  const { data: consent } = useQuery({
    queryKey: ['consent', patientId], queryFn: () => consentService.getByPatient(patientId),
  })

  // Resuelve qué plan se está viendo: el elegido, o el más reciente por defecto.
  const plan: NutritionPlan | undefined = useMemo(() => {
    if (selectedId === 'new') return undefined
    if (selectedId != null) return plans.find(p => p.id === selectedId) ?? plans[0]
    return plans[0]
  }, [plans, selectedId])

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['plans', patientId] })
    qc.invalidateQueries({ queryKey: ['consent', patientId] })
  }

  const genMut = useMutation({
    mutationFn: async () => {
      // Si estamos en "Nuevo plan" (o no hay ninguno) se crea uno; nunca pisa otro.
      const p = (selectedId === 'new' || !plan)
        ? await plansService.create(patientId, `Plan ${new Date().toLocaleDateString()}`)
        : plan
      const res = await plansService.generate(p.id, goal, activity)
      return res
    },
    onSuccess: (res) => { setSelectedId(res.plan.id); invalidate() },
  })
  const notesMut = useMutation({ mutationFn: (v: { id: number; notes?: string; content?: PlanContent }) =>
    plansService.update(v.id, { professional_notes: v.notes, content: v.content }), onSuccess: invalidate })
  const submitMut = useMutation({ mutationFn: (id: number) => plansService.submit(id), onSuccess: invalidate })
  const approveMut = useMutation({ mutationFn: (id: number) => plansService.approve(id), onSuccess: invalidate })
  const shareMut = useMutation({ mutationFn: (id: number) => plansService.share(id), onSuccess: invalidate })
  const revokeMut = useMutation({ mutationFn: (id: number) => plansService.revokeShare(id), onSuccess: invalidate })
  const grantMut = useMutation({ mutationFn: () => consentService.grant(patientId), onSuccess: invalidate })
  const revokeConsentMut = useMutation({ mutationFn: (id: number) => consentService.revoke(id), onSuccess: invalidate })

  const genError = (genMut.error as any)?.response?.data

  if (isLoading) return <div className="py-16 text-center text-sm text-text-muted">Cargando…</div>

  return (
    <div className="space-y-5">
      {/* Consentimiento */}
      <ConsentCard consent={consent} onGrant={() => grantMut.mutate()}
                   onRevoke={(id) => revokeConsentMut.mutate(id)} loading={grantMut.isPending} />

      {/* Historial de planes del paciente: elegir uno o empezar uno nuevo */}
      {plans.length > 0 && (
        <PlanHistoryBar plans={plans} currentId={selectedId === 'new' ? 'new' : (plan?.id ?? null)}
          onSelect={(id) => setSelectedId(id)} onNew={() => setSelectedId('new')} />
      )}

      {/* Sin plan (ninguno aún, o en modo "Nuevo plan"): panel de generación */}
      {!plan && (
        <GeneratePanel {...{ goal, setGoal, activity, setActivity }}
          disabled={!consent?.is_active}
          loading={genMut.isPending}
          onGenerate={() => genMut.mutate()}
          error={genError} />
      )}

      {plan && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">{plan.title}</h2>
              <p className="text-xs text-text-muted mt-0.5">
                {plan.goal ? GOALS.find(g => g.value === plan.goal)?.label : 'Sin objetivo'}
                {plan.approved_at && ` · aprobado el ${new Date(plan.approved_at).toLocaleDateString()}`}
              </p>
            </div>
            <StatusBadge status={plan.status} />
          </div>

          {/* Parámetros (motor de reglas) + restricciones */}
          <div className="grid grid-cols-2 gap-4">
            <TargetsCard plan={plan} />
            <ConstraintsCard plan={plan} />
          </div>

          {/* Plan semanal */}
          {plan.content && 'days' in plan.content ? (
            <WeeklyPlan plan={plan}
              editable={plan.status === 'BORRADOR_IA' || plan.status === 'EN_REVISION'}
              onSave={(content) => notesMut.mutate({ id: plan.id, content })}
              saving={notesMut.isPending} />
          ) : (
            <div className="bg-surface rounded-lg border border-border-base p-5 text-sm text-text-muted">
              Todavía no se generó el contenido del plan.
              <Button size="sm" className="ml-3" loading={genMut.isPending} onClick={() => genMut.mutate()}>
                Generar con IA
              </Button>
            </div>
          )}

          {/* Validación */}
          {plan.last_generation && <ValidationCard trace={plan.last_generation} />}

          {/* Notas del profesional */}
          <NotesCard plan={plan} onSave={(notes) => notesMut.mutate({ id: plan.id, notes })} saving={notesMut.isPending} />

          {/* Flujo de estados */}
          <StateFlow plan={plan}
            onRegenerate={() => genMut.mutate()} regenLoading={genMut.isPending}
            onSubmit={() => submitMut.mutate(plan.id)}
            onApprove={() => approveMut.mutate(plan.id)}
            onShare={() => shareMut.mutate(plan.id)}
            onRevoke={() => revokeMut.mutate(plan.id)} />
        </>
      )}
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function PlanHistoryBar({ plans, currentId, onSelect, onNew }: {
  plans: NutritionPlan[]; currentId: number | 'new' | null
  onSelect: (id: number) => void; onNew: () => void
}) {
  const fmt = (p: NutritionPlan) => {
    const d = new Date(p.created_at ?? Date.now()).toLocaleDateString()
    return `${p.title || 'Plan'} · ${STATUS_BADGE[p.status].label} · ${d}`
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-surface rounded-lg border border-border-base px-5 py-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">Plan</span>
        <select
          className="h-9 rounded border border-border-base bg-surface text-sm px-2 max-w-[22rem]"
          value={currentId === 'new' ? 'new' : (currentId ?? '')}
          onChange={e => e.target.value === 'new' ? onNew() : onSelect(Number(e.target.value))}>
          {currentId === 'new' && <option value="new">Nuevo plan (sin guardar)</option>}
          {plans.map(p => <option key={p.id} value={p.id}>{fmt(p)}</option>)}
        </select>
        <span className="text-xs text-text-disabled">{plans.length} en el historial</span>
      </div>
      <Button size="sm" variant="secondary" onClick={onNew} disabled={currentId === 'new'}>
        + Nuevo plan
      </Button>
    </div>
  )
}

function ConsentCard({ consent, onGrant, onRevoke, loading }: {
  consent: any; onGrant: () => void; onRevoke: (id: number) => void; loading: boolean
}) {
  const active = consent?.is_active
  return (
    <div className="flex items-center justify-between bg-surface rounded-lg border border-border-base px-5 py-3">
      <div className="text-sm">
        <span className="font-medium text-text-primary">Consentimiento para uso de IA</span>
        <span className="ml-2 text-xs" style={{ color: active ? '#2f7d5c' : '#B45309' }}>
          {active ? '● otorgado' : '● no otorgado — requerido para generar'}
        </span>
      </div>
      {active
        ? <button className="text-xs text-text-muted hover:text-danger" onClick={() => onRevoke(consent.id)}>Revocar</button>
        : <Button size="sm" variant="secondary" loading={loading} onClick={onGrant}>Registrar consentimiento</Button>}
    </div>
  )
}

function GeneratePanel({ goal, setGoal, activity, setActivity, disabled, loading, onGenerate, error }: any) {
  return (
    <div className="bg-surface rounded-lg border border-border-base p-6">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Generar plan con IA supervisada</h3>
      <p className="text-xs text-text-muted mb-4">
        El motor de reglas calcula calorías y macros antes de la IA; vos revisás y aprobás.
      </p>
      <div className="flex items-end gap-3 flex-wrap">
        <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">Objetivo
          <select className="h-9 rounded border border-border-base bg-surface text-sm px-2" value={goal}
                  onChange={e => setGoal(e.target.value)}>
            {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-text-muted">Nivel de actividad
          <select className="h-9 rounded border border-border-base bg-surface text-sm px-2" value={activity}
                  onChange={e => setActivity(e.target.value)}>
            {ACTIVITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
        <Button loading={loading} disabled={disabled} onClick={onGenerate}>Generar con IA</Button>
      </div>
      {disabled && <p className="text-xs text-warn mt-3" style={{ color: '#B45309' }}>Primero registrá el consentimiento del paciente.</p>}
      {error && <p className="text-xs text-danger mt-3">{error.detail ?? 'No se pudo generar.'}</p>}
    </div>
  )
}

function TargetsCard({ plan }: { plan: NutritionPlan }) {
  return (
    <div className="bg-surface rounded-lg border border-border-base p-5">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Parámetros (motor de reglas)</h3>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl font-semibold" style={{ color: '#1E4D6B' }}>{plan.target_kcal ?? '—'}</span>
        <span className="text-sm text-text-muted">kcal / día</span>
      </div>
      <div className="flex gap-5 mt-3 text-sm">
        <span>Proteínas <b className="font-mono">{plan.target_protein_g ?? '—'} g</b></span>
        <span>Carbohidratos <b className="font-mono">{plan.target_carbs_g ?? '—'} g</b></span>
        <span>Grasas <b className="font-mono">{plan.target_fat_g ?? '—'} g</b></span>
      </div>
    </div>
  )
}

function ConstraintsCard({ plan }: { plan: NutritionPlan }) {
  return (
    <div className="bg-surface rounded-lg border border-border-base p-5">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Restricciones duras</h3>
      {plan.hard_constraints?.length
        ? <div className="flex flex-wrap gap-2">
            {plan.hard_constraints.map((c, i) => (
              <span key={i} className="text-xs font-medium rounded px-2 py-1"
                    style={{ background: '#fbeaea', color: '#C4463A', border: '1px solid #f0c7c2' }}>{c}</span>
            ))}
          </div>
        : <p className="text-sm text-text-muted">Sin restricciones registradas.</p>}
    </div>
  )
}

function WeeklyPlan({ plan, editable, onSave, saving }: {
  plan: NutritionPlan; editable: boolean; onSave: (c: PlanContent) => void; saving: boolean
}) {
  const content = plan.content as PlanContent
  const [draft, setDraft] = useState<PlanContent>(content)
  const [editing, setEditing] = useState(false)
  useEffect(() => { setDraft(content) }, [plan.id, plan.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const slotsPresent = useMemo(() => {
    const set = new Set<string>()
    draft.days?.forEach(d => d.meals.forEach(m => set.add(m.slot)))
    return SLOTS.filter(s => set.has(s))
  }, [draft])

  const setMeal = (di: number, slot: string, text: string) => {
    setDraft(prev => ({
      days: prev.days.map((d, i) => i !== di ? d
        : { ...d, meals: d.meals.map(m => m.slot === slot ? { ...m, text } : m) }),
    }))
  }

  return (
    <div className="bg-surface rounded-lg border border-border-base overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <b className="text-sm">Plan semanal {plan.status === 'BORRADOR_IA' ? 'propuesto por IA' : ''}</b>
        {editable && (editing
          ? <div className="flex gap-2">
              <button className="text-xs text-text-muted" onClick={() => { setDraft(content); setEditing(false) }}>Cancelar</button>
              <Button size="sm" loading={saving} onClick={() => { onSave(draft); setEditing(false) }}>Guardar cambios</Button>
            </div>
          : <button className="text-xs font-medium text-primary-700" onClick={() => setEditing(true)}>Editar</button>)}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[11px] uppercase text-text-muted font-semibold px-3 py-2 bg-subtle">Día</th>
              {slotsPresent.map(s => <th key={s} className="text-left text-[11px] uppercase text-text-muted font-semibold px-3 py-2 bg-subtle">{SLOT_LABEL[s]}</th>)}
            </tr>
          </thead>
          <tbody>
            {draft.days?.map((day, di) => (
              <tr key={di} className="border-t border-border-subtle">
                <td className="px-3 py-2 text-sm font-medium align-top">{day.label}</td>
                {slotsPresent.map(s => {
                  const meal = day.meals.find(m => m.slot === s)
                  return (
                    <td key={s} className="px-3 py-2 text-sm align-top">
                      {editing
                        ? <input className="w-full text-sm border border-border-base rounded px-1.5 py-1"
                                 value={meal?.text ?? ''} onChange={e => setMeal(di, s, e.target.value)} />
                        : <>
                            <div className="text-text-primary">{meal?.text ?? '—'}</div>
                            {meal && <div className="text-[11px] text-text-disabled font-mono">{Math.round(meal.kcal)} kcal</div>}
                          </>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ValidationCard({ trace }: { trace: NonNullable<NutritionPlan['last_generation']> }) {
  const r = trace.validation_report
  const ok = r?.passed
  const issues = [...(r?.violations ?? []), ...(r?.guideline_issues ?? [])]
  return (
    <div className="rounded-lg border px-5 py-4"
         style={ok ? { background: '#e9f6f0', borderColor: '#c3e6d4' } : { background: '#fff6f5', borderColor: '#f0c7c2' }}>
      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: ok ? '#2f7d5c' : '#C4463A' }}>
        <span className="w-4 h-4 rounded-full inline-flex items-center justify-center text-white text-[11px]"
              style={{ background: ok ? '#3DAA7F' : '#C4463A' }}>{ok ? '✓' : '!'}</span>
        Validación post-IA: {ok ? 'cumple el objetivo y las guías' : 'requiere revisión'}
        {r && <span className="font-normal text-text-muted ml-1">
          ({Math.round(r.avg_kcal)} kcal prom · obj. {r.target_kcal})</span>}
      </div>
      {!ok && issues.length > 0 && (
        <ul className="mt-2 text-xs text-danger list-disc pl-5 space-y-0.5">
          {issues.slice(0, 6).map((i, k) => <li key={k}>{i}</li>)}
        </ul>
      )}
      {/* La trazabilidad (proveedor, modelo, versión de prompt, costo, seudonimización)
          se registra en la DB por cada generación (RF-IA-07) pero no se muestra en la UI. */}
    </div>
  )
}

function NotesCard({ plan, onSave, saving }: { plan: NutritionPlan; onSave: (v: string) => void; saving: boolean }) {
  const [notes, setNotes] = useState(plan.professional_notes)
  useEffect(() => setNotes(plan.professional_notes), [plan.id])
  const editable = plan.status === 'BORRADOR_IA' || plan.status === 'EN_REVISION'
  return (
    <div className="bg-surface rounded-lg border border-border-base p-5">
      <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Notas del profesional</h3>
      <textarea rows={2} disabled={!editable} value={notes} onChange={e => setNotes(e.target.value)}
        className="w-full text-sm border border-border-base rounded px-3 py-2 disabled:bg-subtle"
        placeholder="Observaciones, ajustes, indicaciones…" />
      {editable && (
        <div className="flex justify-end mt-2">
          <Button size="sm" variant="secondary" loading={saving} onClick={() => onSave(notes)}>Guardar notas</Button>
        </div>
      )}
    </div>
  )
}

function StateFlow({ plan, onRegenerate, regenLoading, onSubmit, onApprove, onShare, onRevoke }: {
  plan: NutritionPlan; onRegenerate: () => void; regenLoading: boolean
  onSubmit: () => void; onApprove: () => void; onShare: () => void; onRevoke: () => void
}) {
  const states: PlanStatus[] = ['BORRADOR_IA', 'EN_REVISION', 'APROBADO', 'COMPARTIDO']
  const idx = states.indexOf(plan.status)
  const approved = plan.status === 'APROBADO' || plan.status === 'COMPARTIDO'

  const downloadPdf = async () => {
    const blob = await plansService.pdfBlob(plan.id)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  }
  return (
    <div className="bg-surface rounded-lg border border-border-base p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {states.map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={i <= idx ? { background: '#1E4D6B', color: '#fff' } : { background: '#f1f3f5', color: '#9aa4b0' }}>
                {STATUS_BADGE[s].label}
              </span>
              {i < states.length - 1 && <span className="text-text-disabled text-xs">→</span>}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          {(plan.status === 'BORRADOR_IA' || plan.status === 'EN_REVISION') && (
            <>
              <Button size="sm" variant="secondary" loading={regenLoading} onClick={onRegenerate}>Regenerar</Button>
              {plan.status === 'BORRADOR_IA' && <Button size="sm" variant="secondary" onClick={onSubmit}>Enviar a revisión</Button>}
              <Button size="sm" onClick={onApprove}>Aprobar plan</Button>
            </>
          )}
          {approved && <Button size="sm" variant="secondary" onClick={downloadPdf}>Descargar PDF</Button>}
          {plan.status === 'APROBADO' && <Button size="sm" onClick={onShare}>Compartir con el paciente</Button>}
          {plan.status === 'COMPARTIDO' && (
            <Button size="sm" variant="secondary" onClick={onRevoke}>Revocar enlace</Button>
          )}
        </div>
      </div>
      {plan.status !== 'APROBADO' && plan.status !== 'COMPARTIDO' && (
        <p className="text-xs text-text-muted mt-3">
          ⚠ El paciente accede al plan solo una vez <b>aprobado</b>. La aprobación queda firmada (profesional y fecha).
        </p>
      )}
      {plan.status === 'COMPARTIDO' && plan.share_enabled && (
        <div className="mt-3 flex items-center gap-2">
          <p className="text-xs text-text-muted font-mono break-all flex-1">
            Enlace del paciente: {plansService.publicPdfUrl(plan.share_token)}
          </p>
          <button className="text-xs font-medium text-primary-700 flex-shrink-0"
                  onClick={() => navigator.clipboard?.writeText(plansService.publicPdfUrl(plan.share_token))}>
            Copiar
          </button>
        </div>
      )}
    </div>
  )
}
