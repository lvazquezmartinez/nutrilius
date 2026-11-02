import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { settingsService, type TenantSettings } from '@/services/settings'

const FIELDS: { key: keyof TenantSettings; label: string; placeholder: string }[] = [
  { key: 'business_name', label: 'Nombre comercial', placeholder: 'Nombre del consultorio' },
  { key: 'nutritionist_name', label: 'Profesional', placeholder: 'Nombre del nutricionista' },
  { key: 'license_number', label: 'Matrícula', placeholder: 'MP 12345' },
  { key: 'slug', label: 'Identificador público (slug)', placeholder: 'mi-consultorio' },
  { key: 'logo_url', label: 'URL del logo', placeholder: 'https://…' },
]

export function ConfigPage() {
  const qc = useQueryClient()
  const user = useAuthStore(s => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const [form, setForm] = useState<Partial<TenantSettings>>({})
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: settingsService.get })
  useEffect(() => { if (data) setForm(data) }, [data])

  const saveMut = useMutation({
    mutationFn: () => settingsService.update(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); setSaved(true); setTimeout(() => setSaved(false), 2500) },
  })
  const error = (saveMut.error as any)?.response?.status === 403
    ? 'Solo el administrador del consultorio puede editar la configuración.'
    : (saveMut.error as any) ? 'No se pudo guardar.' : null

  if (isLoading) return <div className="py-16 text-center text-sm text-text-muted">Cargando…</div>

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Configuración del consultorio</h1>
      <p className="text-sm text-text-muted mb-6">Estos datos aparecen en el PDF de los planes.</p>

      <div className="bg-surface rounded-lg border border-border-base p-6 space-y-4">
        {FIELDS.map(f => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">{f.label}</label>
            <input
              className="h-9 rounded border border-border-base bg-surface text-sm px-3 disabled:bg-subtle
                         focus:outline-none focus:ring-2 focus:ring-primary-700"
              disabled={!isAdmin}
              placeholder={f.placeholder}
              value={(form[f.key] as string) ?? ''}
              onChange={e => setForm(s => ({ ...s, [f.key]: e.target.value }))}
            />
          </div>
        ))}

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm" style={{ color: '#2f7d5c' }}>Cambios guardados.</p>}

        {isAdmin ? (
          <div className="flex justify-end pt-1">
            <Button loading={saveMut.isPending} onClick={() => saveMut.mutate()}>Guardar cambios</Button>
          </div>
        ) : (
          <p className="text-xs text-text-muted pt-1">Solo el administrador puede editar esta configuración.</p>
        )}
      </div>

      {data?.booking_token && (
        <div className="bg-surface rounded-lg border border-border-base p-6 mt-4">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Enlace público de reservas</h2>
          <p className="text-xs text-text-muted mb-3">Compartilo con tus pacientes: reservan un turno sin registrarse.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-subtle rounded px-3 py-2 break-all">
              {`${window.location.origin}/reservar/${data.booking_token}`}
            </code>
            <Button size="sm" variant="secondary"
              onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/reservar/${data.booking_token}`)}>
              Copiar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
