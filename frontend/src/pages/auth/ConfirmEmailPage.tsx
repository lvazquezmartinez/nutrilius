import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { authService } from '@/services/auth'

type State = 'loading' | 'success' | 'error' | 'expired' | 'missing'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<State>(token ? 'loading' : 'missing')

  useEffect(() => {
    if (!token) return
    authService.confirmEmail(token)
      .then(() => setState('success'))
      .catch((err: any) => {
        const status = err?.response?.status
        const code = err?.response?.data?.code
        if (status === 410 || code === 'TOKEN_EXPIRED') setState('expired')
        else setState('error')
      })
  }, [token])

  const content: Record<State, { icon: string; iconBg: string; iconColor: string; title: string; body: string; action?: React.ReactNode }> = {
    loading: {
      icon: '⟳',
      iconBg: '#E3EDF4',
      iconColor: '#1E4D6B',
      title: 'Confirmando email...',
      body: 'Aguardá un momento.',
    },
    success: {
      icon: '✓',
      iconBg: '#E3F4EE',
      iconColor: '#2D7A5F',
      title: 'Email confirmado',
      body: 'Tu cuenta está activa. Ya podés ingresar al sistema.',
      action: (
        <Link to="/login?confirmed=true"
          className="inline-flex items-center justify-center w-full h-10 rounded bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 transition-colors mt-4">
          Ir al login
        </Link>
      ),
    },
    expired: {
      icon: '⏱',
      iconBg: '#FDF3E3',
      iconColor: '#D4891A',
      title: 'Link vencido',
      body: 'El link de confirmación expiró. Registrate de nuevo para recibir un email válido.',
      action: (
        <Link to="/registro"
          className="inline-flex items-center justify-center w-full h-10 rounded bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 transition-colors mt-4">
          Volver al registro
        </Link>
      ),
    },
    error: {
      icon: '✕',
      iconBg: '#FBEAEA',
      iconColor: '#C0392B',
      title: 'Link inválido',
      body: 'El link de confirmación no es válido o ya fue utilizado.',
      action: (
        <Link to="/login"
          className="text-sm text-primary-700 font-medium hover:underline mt-4 inline-block">
          Ir al login
        </Link>
      ),
    },
    missing: {
      icon: '?',
      iconBg: '#EEF0F2',
      iconColor: '#5E6E7C',
      title: 'Link incompleto',
      body: 'El link de confirmación no contiene un token válido.',
    },
  }

  const c = content[state]

  return (
    <AuthLayout>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: c.iconBg, color: c.iconColor, fontSize: 20 }}>
          {state === 'loading'
            ? <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            : c.icon}
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">{c.title}</h1>
        <p className="text-sm text-text-muted">{c.body}</p>
        {c.action}
      </div>
    </AuthLayout>
  )
}
