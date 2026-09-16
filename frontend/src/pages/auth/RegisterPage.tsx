import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button, Input } from '@/components/ui'
import { authService } from '@/services/auth'

const schema = z.object({
  name:         z.string().min(2, 'Ingresá tu nombre'),
  businessName: z.string().min(2, 'Ingresá el nombre del consultorio'),
  email:        z.string().email('Email inválido'),
  password:     z.string().min(8, 'Mínimo 8 caracteres'),
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm'],
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await authService.register({
        name:         data.name,
        businessName: data.businessName,
        email:        data.email,
        password:     data.password,
      })
      setDone(true)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 409) {
        setServerError('Ya existe una cuenta con ese email.')
      } else {
        setServerError('No se pudo crear la cuenta. Intentá de nuevo.')
      }
    }
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#E3F4EE' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#2D7A5F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">Revisá tu email</h1>
          <p className="text-sm text-text-muted mb-1">
            Enviamos un link de confirmación a
          </p>
          <p className="text-sm font-medium text-text-primary mb-6">{getValues('email')}</p>
          <p className="text-xs text-text-muted">
            Una vez que confirmes el email, podés{' '}
            <Link to="/login" className="text-primary-700 font-medium hover:underline">
              iniciar sesión
            </Link>
            .
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-semibold text-text-primary mb-1">Crear consultorio</h1>
      <p className="text-sm text-text-muted mb-6">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-primary-700 font-medium hover:underline">
          Iniciá sesión
        </Link>
      </p>

      {serverError && (
        <div className="mb-4 px-4 py-3 rounded border text-sm"
          style={{ background: '#FBEAEA', borderColor: '#E8A0A0', color: '#C0392B' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Tu nombre"
          placeholder="Sofía Martínez"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Nombre del consultorio"
          placeholder="Consultorio Martínez"
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="sofia@consultorio.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
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
          Crear consultorio
        </Button>

        <p className="text-xs text-text-muted text-center">
          Al registrarte aceptás los términos de uso del servicio.
        </p>
      </form>
    </AuthLayout>
  )
}
