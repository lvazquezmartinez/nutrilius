import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth'

const schema = z.object({
  email: z.string().email('Email inválido'),
})
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await authService.forgotPassword(data.email)
      setDone(true)
    } catch {
      // Respuesta ambigua intencional — no revelar si el email existe
      setDone(true)
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#E3EDF4' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="#1E4D6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">Revisá tu email</h1>
          <p className="text-sm text-text-muted mb-1">
            Si existe una cuenta con <span className="font-medium text-text-primary">{getValues('email')}</span>,
          </p>
          <p className="text-sm text-text-muted mb-6">
            vas a recibir las instrucciones para restablecer tu contraseña.
          </p>
          <Link to="/login" className="text-sm text-primary-700 font-medium hover:underline">
            Volver al login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Link to="/login" className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary mb-6">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Volver al login
      </Link>

      <h1 className="text-2xl font-semibold text-text-primary mb-1">Recuperar contraseña</h1>
      <p className="text-sm text-text-muted mb-6">
        Ingresá tu email y te enviamos un link para crear una nueva contraseña.
      </p>

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
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full mt-2">
          Enviar instrucciones
        </Button>
      </form>
    </AuthLayout>
  )
}
