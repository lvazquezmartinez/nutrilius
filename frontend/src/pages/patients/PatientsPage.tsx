import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clsx } from 'clsx'
import { patientsService } from '@/services/patients'
import type { PatientListItem } from '@/types/patient'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Icons } from '@/components/ui/Icons'

// ── schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  fullName:    z.string().min(1, 'El nombre es obligatorio').max(200),
  dni:         z.string().max(20).regex(/^\d*$/, 'Solo números').optional().or(z.literal('')),
  sex:         z.enum(['Male', 'Female', 'Other']).optional(),
  phone:       z.string().max(30).optional().or(z.literal('')),
  email:       z.string().email('Email inválido').optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  notes:       z.string().max(2000).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

// ── helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-medium',
      status === 'Active'
        ? 'bg-success-light text-success border border-success-border'
        : 'bg-subtle text-text-muted border border-border-base'
    )}>
      {status === 'Active' ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function NewBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-xs text-xs font-medium bg-accent-100 text-accent-700 border border-accent-200">
      Nuevo
    </span>
  )
}

// ── PatientRow ────────────────────────────────────────────────────────────────
function PatientRow({ patient, onEdit }: { patient: PatientListItem; onEdit: (p: PatientListItem) => void }) {
  const navigate = useNavigate()
  return (
    <tr
      className="group hover:bg-subtle cursor-pointer transition-colors duration-fast"
      onClick={() => navigate(`/pacientes/${patient.id}`)}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary-700">
              {patient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text-primary truncate">{patient.fullName}</span>
              {patient.isNew && <NewBadge />}
            </div>
            {patient.email && (
              <span className="text-xs text-text-muted truncate">{patient.email}</span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{patient.dni ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">{patient.phone ?? '—'}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">{patient.age != null ? `${patient.age} años` : '—'}</td>
      <td className="px-4 py-3"><StatusBadge status={patient.status} /></td>
      <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 rounded hover:bg-base text-text-muted hover:text-text-primary transition-colors"
          onClick={e => { e.stopPropagation(); onEdit(patient) }}
          aria-label="Editar paciente"
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M11.5 2.5a1.5 1.5 0 0 1 2 2L5 13H2v-3L11.5 2.5z" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

// ── PatientForm slide-over ────────────────────────────────────────────────────
function PatientSlideOver({
  patientId,
  defaultValues,
  onClose,
  onSuccess,
}: {
  patientId?: string
  defaultValues?: Partial<FormValues>
  onClose: () => void
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(patientId)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {},
  })

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => patientsService.create({
      fullName: data.fullName,
      dni: data.dni || undefined,
      sex: data.sex || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      notes: data.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      onSuccess()
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => patientsService.update(patientId!, {
      fullName: data.fullName,
      dni: data.dni || undefined,
      sex: data.sex || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      notes: data.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] })
      onSuccess()
    },
  })

  const mutation = isEdit ? updateMutation : createMutation
  const error = (mutation.error as any)?.response?.data?.title

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* backdrop */}
      <div className="flex-1 bg-black/20" onClick={onClose} />

      {/* panel */}
      <div className="w-[420px] bg-surface shadow-lg flex flex-col h-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
          <h2 className="text-md font-semibold text-text-primary">
            {isEdit ? 'Editar paciente' : 'Nuevo paciente'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-subtle text-text-muted hover:text-text-primary transition-colors"
          >
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit(d => mutation.mutate(d))}
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4"
        >
          {error && (
            <div className="px-3 py-2 rounded bg-danger-light border border-danger-border text-sm text-danger">
              {error}
            </div>
          )}

          <Input
            label="Nombre completo *"
            {...register('fullName')}
            error={errors.fullName?.message}
            placeholder="Ej. María González"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="DNI"
              {...register('dni')}
              error={errors.dni?.message}
              placeholder="Ej. 30123456"
              inputMode="numeric"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Sexo</label>
              <select
                {...register('sex')}
                className="h-9 rounded border border-border-base bg-surface text-sm text-text-primary px-3 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors"
              >
                <option value="">— Sin especificar —</option>
                <option value="Female">Femenino</option>
                <option value="Male">Masculino</option>
                <option value="Other">Otro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Teléfono"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="Ej. +54 9 11 1234-5678"
              type="tel"
            />
            <Input
              label="Email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="paciente@mail.com"
              type="email"
            />
          </div>

          <Input
            label="Fecha de nacimiento"
            {...register('dateOfBirth')}
            type="date"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Notas</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="w-full rounded border border-border-base bg-surface text-sm text-text-primary px-3 py-2 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors resize-none"
              placeholder="Alergias, condiciones relevantes, etc."
            />
            {errors.notes && <p className="text-xs text-danger">{errors.notes.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Guardar cambios' : 'Crear paciente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── PatientsPage ──────────────────────────────────────────────────────────────
export function PatientsPage() {
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState<'Active' | 'Inactive' | ''>('')
  const [page, setPage]           = useState(1)
  const [slideOver, setSlideOver] = useState<
    | { type: 'create' }
    | { type: 'edit'; patient: PatientListItem }
    | null
  >(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['patients', search, statusFilter, page],
    queryFn: () => patientsService.list({
      search:   search || undefined,
      status:   statusFilter || undefined,
      page,
      pageSize: 25,
    }),
    placeholderData: prev => prev,
  })

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }, [])

  const handleSlideSuccess = () => {
    setSlideOver(null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Pacientes</h1>
            {data && (
              <p className="text-sm text-text-muted mt-0.5">
                {data.totalCount} {data.totalCount === 1 ? 'paciente' : 'pacientes'} en total
              </p>
            )}
          </div>
          <Button
            icon={<Icons.Users className="w-4 h-4" />}
            onClick={() => setSlideOver({ type: 'create' })}
          >
            Nuevo paciente
          </Button>
        </div>

        {/* filters */}
        <div className="flex items-center gap-3 pb-0">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4" />
                <path d="M9.5 9.5l3 3" />
              </svg>
            </span>
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Buscar por nombre, DNI, email..."
              className="w-full h-9 rounded border border-border-base bg-surface text-sm text-text-primary pl-9 pr-3 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-primary-700 focus:border-primary-700 hover:border-border-strong transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 border border-border-base rounded overflow-hidden text-sm">
            {(['', 'Active', 'Inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1) }}
                className={clsx(
                  'px-3 h-9 font-medium transition-colors duration-fast',
                  statusFilter === s
                    ? 'bg-primary-700 text-text-inverse'
                    : 'text-text-secondary hover:bg-subtle'
                )}
              >
                {s === '' ? 'Todos' : s === 'Active' ? 'Activos' : 'Inactivos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* table */}
      <div className="flex-1 overflow-auto px-8 pt-4 pb-8">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-text-muted">
            <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando pacientes...
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-24 text-danger text-sm">
            Error al cargar los pacientes. Intentá de nuevo.
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {data.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                <Icons.Users className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No se encontraron pacientes</p>
                {search && (
                  <p className="text-xs mt-1">Probá con otro nombre o DNI</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-border-base overflow-hidden bg-surface shadow-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border-base bg-subtle">
                      <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Paciente</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">DNI</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Teléfono</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Edad</th>
                      <th className="px-4 py-2.5 text-xs font-semibold text-text-muted uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-2.5 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {data.items.map(p => (
                      <PatientRow
                        key={p.id}
                        patient={p}
                        onEdit={patient => setSlideOver({ type: 'edit', patient })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-text-secondary">
                <span>
                  Mostrando {(page - 1) * 25 + 1}–{Math.min(page * 25, data.totalCount)} de {data.totalCount}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.hasPreviousPage}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-xs text-text-muted font-mono">
                    {page} / {data.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!data.hasNextPage}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* slide-over */}
      {slideOver && (
        <PatientSlideOver
          patientId={slideOver.type === 'edit' ? slideOver.patient.id : undefined}
          defaultValues={slideOver.type === 'edit' ? {
            fullName:    slideOver.patient.fullName,
            dni:         slideOver.patient.dni ?? '',
            phone:       slideOver.patient.phone ?? '',
            email:       slideOver.patient.email ?? '',
          } : undefined}
          onClose={() => setSlideOver(null)}
          onSuccess={handleSlideSuccess}
        />
      )}
    </div>
  )
}
