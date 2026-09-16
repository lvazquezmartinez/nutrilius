import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setAuth = useAuthStore(s => s.setAuth)
  const [serverError, setServerError] = useState('')

  // Mensajes desde confirmación de email o reset
  const confirmed  = searchParams.get('confirmed') === 'true'
  const resetDone  = searchParams.get('reset') === 'done'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const res = await authService.login(data)
      setAuth(res.user, res.accessToken)
      navigate('/dashboard')
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 403) {
        setServerError('Confirmá tu email antes de iniciar sesión.')
      } else if (status === 401) {
        setServerError('Email o contraseña incorrectos.')
      } else if (status === 423) {
        setServerError('Tu cuenta está desactivada. Contactá al administrador.')
      } else {
        setServerError('No se pudo iniciar sesión. Intentá de nuevo.')
      }
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Iniciar sesión</h1>
      <p className="text-sm text-text-muted mb-6">
        ¿No tenés cuenta?{' '}
        <Link to="/registro" className="text-primary-700 font-medium hover:underline">
          Registrate gratis
        </Link>
      </p>

      {/* Feedback de acciones previas */}
      {confirmed && (
        <div className="mb-4 px-4 py-3 rounded border text-sm font-medium"
          style={{ background: 'var(--color-success-light, #E3F4EE)', borderColor: '#80CEB2', color: '#2D7A5F' }}>
          ✓ Email confirmado. Ya podés ingresar.
        </div>
      )}
      {resetDone && (
        <div className="mb-4 px-4 py-3 rounded border text-sm font-medium"
          style={{ background: 'var(--color-success-light, #E3F4EE)', borderColor: '#80CEB2', color: '#2D7A5F' }}>
          ✓ Contraseña actualizada. Ingresá con tu nueva clave.
        </div>
      )}
      {serverError && (
        <div className="mb-4 px-4 py-3 rounded border text-sm"
          style={{ background: '#FBEAEA', borderColor: '#E8A0A0', color: '#C0392B' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="hola@consultorio.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-1.5 text-right">
            <Link to="/recuperar-password" className="text-xs text-text-muted hover:text-primary-700">
              Olvidé mi contraseña
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full mt-2">
          Ingresar
        </Button>
      </form>
    </AuthLayout>
  )
}
