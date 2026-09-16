import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

// Genera la grilla 7×5 del plan semanal — firma visual de Nutrilius
function MealGridSignature() {
  const cells = Array.from({ length: 35 }, (_, i) => {
    const row = Math.floor(i / 7)
    const col = i % 7
    if (col === 6) return 'accent'
    if (row === 0) return 'filled'
    if (row === 1 && col < 5) return 'filled'
    if (row === 2 && col < 4) return 'filled'
    if (row === 3 && col < 3) return 'filled'
    if (row === 4 && col < 2) return 'filled'
    return 'empty'
  })

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)', width: 140 }}>
      {cells.map((type, i) => (
        <div
          key={i}
          className="rounded-xs"
          style={{
            height: 16,
            background:
              type === 'filled' ? 'rgba(255,255,255,0.25)'
              : type === 'accent' ? '#3DAA7F'
              : 'rgba(255,255,255,0.06)',
          }}
        />
      ))}
    </div>
  )
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — identidad */}
      <div
        className="hidden lg:flex flex-col justify-between p-10 w-[420px] flex-shrink-0"
        style={{ background: '#1E4D6B' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="w-4 h-4 rounded-xs" style={{ background: '#3DAA7F' }} />
          </div>
          <span className="text-white font-semibold text-lg">Nutrilius</span>
        </div>

        {/* Tagline */}
        <div>
          <p
            className="text-white mb-8"
            style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 28, lineHeight: 1.3 }}
          >
            El consultorio nutricional que trabaja con vos
          </p>
          <MealGridSignature />
          <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            7 días · 5 comidas · seguimiento completo
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © {new Date().getFullYear()} Nutrilius
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-base">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-md" style={{ background: '#1E4D6B' }} />
            <span className="font-semibold text-lg text-primary-700">Nutrilius</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
