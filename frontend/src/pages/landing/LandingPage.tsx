import { Link } from 'react-router-dom'

// ─── Firma visual: grilla 7×5 del plan semanal ──────────────
function MealGrid({ scale = 1, tone = 'light' }: { scale?: number; tone?: 'light' | 'dark' }) {
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
  const filled = tone === 'light' ? 'rgba(255,255,255,0.22)' : 'rgba(30,77,107,0.14)'
  const empty = tone === 'light' ? 'rgba(255,255,255,0.06)' : 'rgba(30,77,107,0.05)'
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)', width: 210 * scale }}>
      {cells.map((type, i) => (
        <div
          key={i}
          className="rounded-[3px]"
          style={{
            height: 24 * scale,
            background: type === 'filled' ? filled : type === 'accent' ? '#3DAA7F' : empty,
          }}
        />
      ))}
    </div>
  )
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center"
        style={{ background: inverse ? 'rgba(255,255,255,0.15)' : '#1E4D6B' }}
      >
        <div className="w-4 h-4 rounded-[3px]" style={{ background: '#3DAA7F' }} />
      </div>
      <span className={`font-semibold text-lg ${inverse ? 'text-white' : 'text-primary-700'}`}>
        Nutrilius
      </span>
    </div>
  )
}

function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-base bg-surface p-6">
      <div className="w-9 h-9 rounded-lg mb-4 flex items-center justify-center bg-accent-50">
        <div className="w-3.5 h-3.5 rounded-[3px] bg-accent-500" />
      </div>
      <h3 className="text-md font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{children}</p>
    </div>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="font-mono text-sm text-accent-500 pt-0.5 flex-shrink-0">{n}</div>
      <div>
        <h4 className="text-md font-semibold text-white mb-1">{title}</h4>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{children}</p>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      {/* ─── Nav ─────────────────────────────────────────── */}
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur sticky top-0 z-10">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-2">
              Ingresar
            </Link>
            <Link
              to="/registro"
              className="text-sm font-semibold text-white px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-800 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-accent-700 bg-accent-50 border border-accent-200 rounded-full px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            IA supervisada por el profesional
          </div>
          <h1 className="text-4xl lg:text-display font-bold tracking-tight text-text-primary">
            Tu consultorio de nutrición,{' '}
            <span className="font-serif italic font-normal text-primary-700">ordenado</span> y
            asistido por IA.
          </h1>
          <p className="mt-5 text-lg text-text-secondary leading-relaxed max-w-xl">
            Pacientes, anamnesis, agenda y planes alimentarios en un solo lugar. La IA propone el
            plan; vos lo revisás y aprobás. Siempre.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/registro"
              className="text-sm font-semibold text-white px-5 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 transition-colors"
            >
              Empezá gratis
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold text-primary-700 px-5 py-3 rounded-lg border border-border-strong hover:bg-subtle transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-muted">Sin tarjeta. Datos de salud protegidos.</p>
        </div>

        {/* Panel de marca con la grilla */}
        <div className="rounded-2xl p-10 flex flex-col justify-between min-h-[320px]" style={{ background: '#1E4D6B' }}>
          <p
            className="text-white mb-8"
            style={{ fontFamily: 'Instrument Serif, serif', fontStyle: 'italic', fontSize: 26, lineHeight: 1.35 }}
          >
            «La semana de tu paciente, en una grilla.»
          </p>
          <MealGrid tone="light" />
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Todo lo que hacés, en un solo lugar</h2>
        <p className="text-text-muted mb-10 max-w-xl">Dejá las planillas sueltas. Centralizá la operación del consultorio.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature title="Pacientes e historia clínica">
            Anamnesis estructurada, métricas antropométricas y evoluciones, con el historial completo de cada paciente.
          </Feature>
          <Feature title="Agenda y turnos">
            Organizá tu semana, gestioná los turnos y llevá el control de las visitas.
          </Feature>
          <Feature title="Planes con IA supervisada">
            Generá el borrador del plan en segundos y ajustalo a tu criterio antes de compartirlo.
          </Feature>
          <Feature title="Datos de salud protegidos">
            Información clínica cifrada y con trazabilidad de acceso. Cumple con la normativa de datos sensibles.
          </Feature>
        </div>
      </section>

      {/* ─── Cómo funciona la IA (diferencial) ───────────── */}
      <section className="py-20" style={{ background: '#0D2233' }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">La IA propone. Vos decidís.</h2>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              No es un chatbot que arma planes solo. Es un asistente acotado por reglas nutricionales,
              y ningún plan llega al paciente sin tu aprobación.
            </p>
          </div>
          <div className="flex flex-col gap-7">
            <Step n="01" title="Motor de reglas">
              Calcula requerimiento energético, macros y restricciones según patologías, alergías e intolerancias.
            </Step>
            <Step n="02" title="IA acotada">
              Propone alimentos y variedad dentro de esos límites, localizado a Argentina.
            </Step>
            <Step n="03" title="Tu aprobación">
              Revisás, editás y aprobás. Recién ahí el plan se comparte con el paciente.
            </Step>
          </div>
        </div>
      </section>

      {/* ─── CTA final ───────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-3">
          Empezá a ordenar tu consultorio <span className="font-serif italic font-normal text-accent-600">hoy</span>.
        </h2>
        <p className="text-text-muted mb-8 max-w-md mx-auto">Creá tu cuenta gratis y cargá tu primer paciente en minutos.</p>
        <Link
          to="/registro"
          className="inline-block text-sm font-semibold text-white px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <p className="text-xs text-text-muted">© {new Date().getFullYear()} Nutrilius</p>
        </div>
      </footer>
    </div>
  )
}
