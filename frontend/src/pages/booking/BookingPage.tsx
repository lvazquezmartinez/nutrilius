import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { api } from '@/lib/api'

interface BookingInfo { consultorio: string; profesional: string; slots: string[] }

export function BookingPage() {
  const { token = '' } = useParams()
  const [slot, setSlot] = useState<string>('')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [done, setDone] = useState(false)

  const { data, isLoading, isError } = useQuery<BookingInfo>({
    queryKey: ['booking', token],
    queryFn: () => api.get(`/public/booking/${token}`).then(r => r.data),
    retry: false,
  })

  const byDay = useMemo(() => {
    const map: Record<string, string[]> = {}
    ;(data?.slots ?? []).forEach(s => {
      const k = s.slice(0, 10)
      ;(map[k] ??= []).push(s)
    })
    return Object.entries(map).slice(0, 6)
  }, [data])

  const book = useMutation({
    mutationFn: () => api.post(`/public/booking/${token}`, { slot, ...form }),
    onSuccess: () => setDone(true),
  })

  const wrap = (children: React.ReactNode) => (
    <div style={{ minHeight: '100vh', background: '#F5F6F5', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>{children}</div>
    </div>
  )

  if (isLoading) return wrap(<p className="text-center text-text-muted">Cargando…</p>)
  if (isError || !data) return wrap(
    <div className="bg-surface rounded-xl border border-border-base p-8 text-center">
      <h1 className="text-lg font-semibold text-text-primary mb-1">Enlace no válido</h1>
      <p className="text-sm text-text-muted">El enlace de reservas no es correcto o fue dado de baja.</p>
    </div>
  )

  if (done) return wrap(
    <div className="bg-surface rounded-xl border border-border-base p-8 text-center">
      <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl" style={{ background: '#3DAA7F' }}>✓</div>
      <h1 className="text-lg font-semibold text-text-primary mb-1">¡Turno reservado!</h1>
      <p className="text-sm text-text-muted">
        {slot && format(parseISO(slot), "EEEE d 'de' MMMM, HH:mm 'hs'", { locale: es })} — {data.consultorio}
      </p>
    </div>
  )

  return wrap(
    <div className="bg-surface rounded-xl border border-border-base overflow-hidden">
      <div className="px-7 py-5 border-b border-border-subtle" style={{ background: '#1E4D6B' }}>
        <h1 className="text-lg font-semibold text-white">{data.consultorio}</h1>
        {data.profesional && <p className="text-sm text-white/80">{data.profesional}</p>}
        <p className="text-xs text-white/70 mt-1">Reservá tu turno — sin registro</p>
      </div>
      <div className="p-7 space-y-5">
        <div>
          <p className="text-sm font-medium text-text-primary mb-2">Elegí un horario</p>
          <div className="space-y-3 max-h-64 overflow-auto">
            {byDay.map(([day, slots]) => (
              <div key={day}>
                <p className="text-xs font-semibold text-text-muted uppercase mb-1.5 capitalize">
                  {format(parseISO(day + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {slots.map(s => (
                    <button key={s} onClick={() => setSlot(s)}
                      className="text-sm px-3 py-1.5 rounded-md border transition-colors"
                      style={slot === s
                        ? { background: '#1E4D6B', color: '#fff', borderColor: '#1E4D6B' }
                        : { borderColor: '#E7E9EC', color: '#1F2A30' }}>
                      {format(parseISO(s), 'HH:mm')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {([['name', 'Nombre y apellido *'], ['email', 'Email'], ['phone', 'Teléfono']] as const).map(([k, label]) => (
            <input key={k} placeholder={label}
              className="w-full h-10 rounded-md border border-border-base px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
          ))}
        </div>

        {(book.error as any) && <p className="text-sm text-danger">{(book.error as any)?.response?.data?.detail ?? 'No se pudo reservar.'}</p>}

        <button disabled={!slot || !form.name || book.isPending}
          onClick={() => book.mutate()}
          className="w-full h-11 rounded-md text-white font-medium disabled:opacity-50"
          style={{ background: '#3DAA7F' }}>
          {book.isPending ? 'Reservando…' : 'Confirmar turno'}
        </button>
      </div>
    </div>
  )
}
