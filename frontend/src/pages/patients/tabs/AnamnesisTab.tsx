import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { anamnesisService } from '@/services/anamnesis'
import type { Anamnesis, UpsertAnamnesisRequest } from '@/types/anamnesis'
import { Button } from '@/components/ui/Button'

// ── form field helpers ────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      {children}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props
  return (
    <Field label={label}>
      <input
        type="text"
        className="h-9 rounded border border-border-base bg-surface text-sm text-text-primary px-3 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors"
        {...rest}
      />
    </Field>
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; rows?: number }) {
  const { label, rows = 2, ...rest } = props
  return (
    <Field label={label}>
      <textarea
        rows={rows}
        className="w-full rounded border border-border-base bg-surface text-sm text-text-primary px-3 py-2 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors resize-none"
        {...rest}
      />
    </Field>
  )
}

function NumInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; unit?: string }) {
  const { label, unit, ...rest } = props
  return (
    <Field label={label}>
      <div className="relative flex items-center">
        <input
          type="number"
          step="0.1"
          min="0"
          className="w-full h-9 rounded border border-border-base bg-surface text-sm text-text-primary pl-3 pr-10 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors"
          {...rest}
        />
        {unit && <span className="absolute right-3 text-xs text-text-muted">{unit}</span>}
      </div>
    </Field>
  )
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-lg border border-border-base shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border-base bg-subtle">
        <span className="w-5 h-5 rounded bg-primary-700 text-text-inverse text-xs font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  )
}

// ── read helpers ──────────────────────────────────────────────────────────────
function ReadRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="grid grid-cols-[180px_1fr] gap-2 py-1.5 border-b border-border-subtle last:border-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-sm text-text-primary whitespace-pre-line">{String(value)}</dd>
    </div>
  )
}

function ReadSection({ number, title, children, hasContent }: {
  number: string; title: string; children: React.ReactNode; hasContent: boolean
}) {
  if (!hasContent) return null
  return (
    <div className="bg-surface rounded-lg border border-border-base shadow-xs overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border-base bg-subtle">
        <span className="w-5 h-5 rounded bg-primary-700 text-text-inverse text-xs font-bold flex items-center justify-center flex-shrink-0">
          {number}
        </span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <dl className="px-5 py-2">{children}</dl>
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export function AnamnesisTab({ patientId }: { patientId: string }) {
  const [editing, setEditing] = useState(false)
  const queryClient = useQueryClient()

  const { data: anamnesis, isLoading } = useQuery({
    queryKey: ['anamnesis', patientId],
    queryFn: () => anamnesisService.get(patientId),
  })

  const { register, handleSubmit, reset } = useForm<UpsertAnamnesisRequest>({
    defaultValues: anamnesis ?? {},
  })

  const mutation = useMutation({
    mutationFn: (data: UpsertAnamnesisRequest) => anamnesisService.upsert(patientId, {
      ...data,
      mealsPerDay: data.mealsPerDay ? Number(data.mealsPerDay) : null,
      weightKg: data.weightKg ? Number(data.weightKg) : null,
      heightCm: data.heightCm ? Number(data.heightCm) : null,
      waistCm: data.waistCm ? Number(data.waistCm) : null,
      neckCm: data.neckCm ? Number(data.neckCm) : null,
      hipCm: data.hipCm ? Number(data.hipCm) : null,
      armCm: data.armCm ? Number(data.armCm) : null,
    }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['anamnesis', patientId], saved)
      setEditing(false)
    },
  })

  const handleEdit = () => {
    reset((anamnesis as any) ?? {})
    setEditing(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted text-sm">
        <svg className="w-4 h-4 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Cargando...
      </div>
    )
  }

  // ── READ MODE ─────────────────────────────────────────────────────────────
  if (!editing) {
    const a = anamnesis as Anamnesis | null | undefined
    const hasData = !!a

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Anamnesis</h2>
            {hasData && a.updatedAt && (
              <p className="text-xs text-text-muted mt-0.5">
                Última actualización: {new Date(a.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <Button size="sm" variant={hasData ? 'secondary' : 'primary'} onClick={handleEdit}>
            {hasData ? 'Editar' : 'Completar anamnesis'}
          </Button>
        </div>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted border border-dashed border-border-base rounded-lg">
            <svg viewBox="0 0 24 24" className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p className="text-sm font-medium">Sin anamnesis registrada</p>
            <p className="text-xs mt-1">Completá la historia clínica del paciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ReadSection number="1" title="Datos Generales" hasContent={!!(a.occupation || a.reasonForConsultation)}>
              <ReadRow label="Ocupación" value={a.occupation} />
              <ReadRow label="Motivo de consulta" value={a.reasonForConsultation} />
            </ReadSection>

            <ReadSection number="2" title="Antecedentes patológicos personales"
              hasContent={!!(a.medications || a.alcoholConsumption || a.smokingStatus || a.digestiveSymptoms)}>
              <ReadRow label="Medicación" value={a.medications} />
              <ReadRow label="Alcohol" value={a.alcoholConsumption} />
              <ReadRow label="Tabaco" value={a.smokingStatus} />
              <ReadRow label="Síntomas gástricos/GI" value={a.digestiveSymptoms} />
            </ReadSection>

            <ReadSection number="3" title="Hábitos y Alimentación"
              hasContent={!!(a.mealsPerDay || a.whoCooks || a.eatingOutFrequency || a.supplements || a.foodAllergies || a.medicalCulturalRestrictions || a.foodAversions || a.habitsComments)}>
              <ReadRow label="Comidas al día" value={a.mealsPerDay} />
              <ReadRow label="¿Quién cocina?" value={a.whoCooks} />
              <ReadRow label="Come fuera de casa" value={a.eatingOutFrequency} />
              <ReadRow label="Suplementos" value={a.supplements} />
              <ReadRow label="Alergias alimentarias" value={a.foodAllergies} />
              <ReadRow label="Restricciones médicas/culturales" value={a.medicalCulturalRestrictions} />
              <ReadRow label="Alimentos que no le gustan" value={a.foodAversions} />
              <ReadRow label="Comentarios" value={a.habitsComments} />
            </ReadSection>

            <ReadSection number="4" title="Recordatorio 24hs"
              hasContent={!!(a.recall24hBreakfast || a.recall24hMorningSnack || a.recall24hLunch || a.recall24hAfternoonSnack || a.recall24hDinner || a.recall24hWater || a.recall24hSweets || a.recall24hCookingMethods)}>
              <ReadRow label="Desayuno" value={a.recall24hBreakfast} />
              <ReadRow label="Colación" value={a.recall24hMorningSnack} />
              <ReadRow label="Almuerzo" value={a.recall24hLunch} />
              <ReadRow label="Merienda" value={a.recall24hAfternoonSnack} />
              <ReadRow label="Cena" value={a.recall24hDinner} />
              <ReadRow label="Agua" value={a.recall24hWater} />
              <ReadRow label="Dulces" value={a.recall24hSweets} />
              <ReadRow label="Métodos de cocción" value={a.recall24hCookingMethods} />
            </ReadSection>

            <ReadSection number="5" title="Actividad Física" hasContent={!!a.physicalActivity}>
              <ReadRow label="Actividad física" value={a.physicalActivity} />
            </ReadSection>

            <ReadSection number="6" title="Examen Físico"
              hasContent={!!(a.weightKg || a.heightCm || a.waistCm || a.neckCm || a.hipCm || a.armCm)}>
              <ReadRow label="Peso" value={a.weightKg != null ? `${a.weightKg} kg` : null} />
              <ReadRow label="Talla" value={a.heightCm != null ? `${a.heightCm} cm` : null} />
              <ReadRow label="Circunferencia de cintura" value={a.waistCm != null ? `${a.waistCm} cm` : null} />
              <ReadRow label="Circunferencia de cuello" value={a.neckCm != null ? `${a.neckCm} cm` : null} />
              <ReadRow label="Circunferencia de cadera" value={a.hipCm != null ? `${a.hipCm} cm` : null} />
              <ReadRow label="Circunferencia de brazo" value={a.armCm != null ? `${a.armCm} cm` : null} />
            </ReadSection>

            <ReadSection number="7" title="Comentarios" hasContent={!!a.finalComments}>
              <ReadRow label="" value={a.finalComments} />
            </ReadSection>
          </div>
        )}
      </div>
    )
  }

  // ── EDIT MODE ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-text-primary">Anamnesis</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => { reset((anamnesis as any) ?? {}); setEditing(false) }}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={mutation.isPending}>Guardar</Button>
        </div>
      </div>

      {mutation.error && (
        <div className="px-3 py-2 rounded bg-danger-light border border-danger-border text-sm text-danger">
          {(mutation.error as any)?.response?.data?.title ?? 'Error al guardar'}
        </div>
      )}

      {/* 1 */}
      <Section number="1" title="Datos Generales">
        <TextInput label="Ocupación" placeholder="Empleada, estudiante, ama de casa..." {...register('occupation')} />
        <Textarea label="Motivo de consulta" rows={2} placeholder="¿Por qué busca atención nutricional?" {...register('reasonForConsultation')} />
      </Section>

      {/* 2 */}
      <Section number="2" title="Antecedentes patológicos personales">
        <Textarea label="Medicación" rows={2} placeholder="Nombre, dosis, frecuencia" {...register('medications')} />
        <TextInput label="Alcohol" placeholder="Sin consumo / Social / Frecuente..." {...register('alcoholConsumption')} />
        <TextInput label="Tabaco" placeholder="No fuma / Ex fumador / Fumador (cant./día)" {...register('smokingStatus')} />
        <Textarea label="Síntomas gástricos / gastrointestinales" rows={2} placeholder="Distensión, constipación, reflujo, SII..." {...register('digestiveSymptoms')} />
      </Section>

      {/* 3 */}
      <Section number="3" title="Hábitos y Alimentación">
        <div className="grid grid-cols-2 gap-4">
          <Field label="¿Cuántas comidas realizás al día?">
            <input
              type="number"
              min={1}
              max={10}
              className="h-9 rounded border border-border-base bg-surface text-sm text-text-primary px-3 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors"
              placeholder="Ej: 5"
              {...register('mealsPerDay', { valueAsNumber: true })}
            />
          </Field>
          <TextInput label="¿Cocina él/ella u otro?" placeholder="Ella misma / pareja / empleada..." {...register('whoCooks')} />
        </div>
        <TextInput label="¿Consume alimentos fuera de casa? (frecuencia)" placeholder="Nunca / 2 veces por semana / Todos los días..." {...register('eatingOutFrequency')} />
        <TextInput label="¿Utiliza suplementos?" placeholder="Proteína whey, vitamina D, omega 3..." {...register('supplements')} />
        <TextInput label="Alergia a algún alimento" placeholder="Lactosa, gluten, maní, mariscos..." {...register('foodAllergies')} />
        <TextInput label="Restricciones médicas o culturales" placeholder="Celiaquía, vegetarianismo, halal..." {...register('medicalCulturalRestrictions')} />
        <TextInput label="Algo que no le guste" placeholder="Alimentos que no tolera o evita" {...register('foodAversions')} />
        <Textarea label="Comentarios" rows={2} placeholder="Observaciones adicionales sobre hábitos" {...register('habitsComments')} />
      </Section>

      {/* 4 */}
      <Section number="4" title="Recordatorio 24hs">
        <div className="grid grid-cols-2 gap-4">
          <Textarea label="Desayuno" rows={2} placeholder="Ej: 1 taza de café con leche, 2 tostadas con mermelada" {...register('recall24hBreakfast')} />
          <Textarea label="Colación" rows={2} placeholder="Ej: 1 fruta, yogur" {...register('recall24hMorningSnack')} />
          <Textarea label="Almuerzo" rows={2} placeholder="Ej: arroz con pollo, ensalada" {...register('recall24hLunch')} />
          <Textarea label="Merienda" rows={2} placeholder="Ej: mate con galletitas" {...register('recall24hAfternoonSnack')} />
          <Textarea label="Cena" rows={2} placeholder="Ej: sopa, pan, fruta" {...register('recall24hDinner')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <TextInput label="Agua (consumo)" placeholder="Ej: 1 litro/día" {...register('recall24hWater')} />
          <TextInput label="Dulces" placeholder="Ej: 2 facturas por semana" {...register('recall24hSweets')} />
          <TextInput label="Métodos de cocción" placeholder="Hervido, al horno, frito..." {...register('recall24hCookingMethods')} />
        </div>
      </Section>

      {/* 5 */}
      <Section number="5" title="Actividad Física">
        <Textarea label="Actividad física" rows={3} placeholder="Tipo de actividad, frecuencia semanal, duración, intensidad. Ej: Caminata 30 min × 3 veces/sem" {...register('physicalActivity')} />
      </Section>

      {/* 6 */}
      <Section number="6" title="Examen Físico">
        <div className="grid grid-cols-3 gap-4">
          <NumInput label="Peso" unit="kg" placeholder="Ej: 68.5" {...register('weightKg')} />
          <NumInput label="Talla" unit="cm" placeholder="Ej: 165" {...register('heightCm')} />
        </div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide pt-1">Circunferencias</p>
        <div className="grid grid-cols-3 gap-4">
          <NumInput label="Cintura" unit="cm" placeholder="—" {...register('waistCm')} />
          <NumInput label="Cuello" unit="cm" placeholder="—" {...register('neckCm')} />
          <NumInput label="Cadera" unit="cm" placeholder="—" {...register('hipCm')} />
          <NumInput label="Brazo" unit="cm" placeholder="—" {...register('armCm')} />
        </div>
      </Section>

      {/* 7 */}
      <Section number="7" title="Comentarios">
        <Textarea label="" rows={4} placeholder="Comentarios finales, observaciones del profesional..." {...register('finalComments')} />
      </Section>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => { reset((anamnesis as any) ?? {}); setEditing(false) }}>
          Cancelar
        </Button>
        <Button type="submit" loading={mutation.isPending}>Guardar anamnesis</Button>
      </div>
    </form>
  )
}
