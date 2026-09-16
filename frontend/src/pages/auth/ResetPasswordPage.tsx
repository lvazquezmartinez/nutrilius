import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth'

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm'],
})
type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary mb-2">Link inválido</h1>
          <p className="text-sm text-text-muted mb-4">El link de recuperación no es válido.</p>
          <Link to="/recuperar-password" className="text-sm text-primary-700 font-medium hover:underline">
            Solicitar nuevo link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await authService.resetPassword(token!, data.password)
      navigate('/login?reset=done')
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 410) {
        setServerError('El link de recuperación expiró. Solicitá uno nuevo.')
      } else {
        setServerError('No se pudo cambiar la contraseña. Intentá de nuevo.')
      }
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Nueva contraseña</h1>
      <p className="text-sm text-text-muted mb-6">
        Elegí una contraseña de al menos 8 caracteres.
      </p>

      {serverError && (
        <div className="mb-4 px-4 py-3 rounded border text-sm"
          style={{ background: '#FBEAEA', borderColor: '#E8A0A0', color: '#C0392B' }}>
          {serverError}{' '}
          {serverError.includes('expiró') && (
            <Link to="/recuperar-password" className="underline font-medium">Solicitá uno nuevo</Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Repetir contraseña"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.passwordConfirm?.message}
          {...register('passwordConfirm')}
        />

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full mt-2">
          Guardar contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
