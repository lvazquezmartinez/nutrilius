import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GOOGLE_CLIENT_ID } from '@/config'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'
import { Button, Input } from '@/components/ui'

interface Pending {
  credential: string
  email: string
  first_name: string
  last_name: string
}

export function GoogleAuthButton() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const divRef = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState<Pending | null>(null)
  const [businessName, setBusinessName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let tries = 0
    const iv = setInterval(() => {
      const g = (window as any).google
      if (g?.accounts?.id && divRef.current) {
        clearInterval(iv)
        g.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential })
        g.accounts.id.renderButton(divRef.current, {
          theme: 'outline', size: 'large', width: 320,
          text: 'continue_with', shape: 'rectangular', locale: 'es',
        })
      } else if (++tries > 50) {
        clearInterval(iv)
      }
    }, 100)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCredential(response: { credential: string }) {
    setError('')
    try {
      const res = await authService.googleLogin(response.credential)
      if ('needs_registration' in res) {
        setPending({
          credential: response.credential,
          email: res.email,
          first_name: res.first_name,
          last_name: res.last_name,
        })
      } else {
        setAuth(res.user, res.access, res.refresh)
        navigate('/dashboard')
      }
    } catch {
      setError('No se pudo iniciar con Google. Intentá de nuevo.')
    }
  }

  async function completeRegister() {
    if (!pending || businessName.trim().length < 2) {
      setError('Ingresá el nombre del consultorio.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authService.googleRegister({
        credential: pending.credential,
        business_name: businessName.trim(),
        first_name: pending.first_name,
        last_name: pending.last_name,
      })
      setAuth(res.user, res.access, res.refresh)
      navigate('/dashboard')
    } catch {
      setError('No se pudo crear el consultorio. Intentá de nuevo.')
      setLoading(false)
    }
  }

  // Paso 2: usuario nuevo de Google → completar el nombre del consultorio.
  if (pending) {
    return (
      <div className="rounded-lg border border-border-base bg-subtle p-4">
        <p className="text-sm text-text-secondary mb-3">
          ¡Casi listo{pending.first_name ? `, ${pending.first_name}` : ''}! Ponele nombre a tu consultorio para terminar.
        </p>
        <Input
          label="Nombre del consultorio"
          placeholder="Consultorio Martínez"
          value={businessName}
          onChange={e => setBusinessName(e.target.value)}
        />
        {error && <p className="text-sm text-danger mt-2">{error}</p>}
        <Button onClick={completeRegister} loading={loading} className="w-full mt-3">
          Crear consultorio con Google
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div ref={divRef} className="flex justify-center" />
      {error && <p className="text-sm text-danger mt-2 text-center">{error}</p>}
    </div>
  )
}
