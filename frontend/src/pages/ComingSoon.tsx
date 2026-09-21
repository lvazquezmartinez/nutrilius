export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center mb-5">
        <div className="w-4 h-4 rounded-[3px] bg-accent-500" />
      </div>
      <h1 className="text-2xl font-semibold text-text-primary mb-2">{title}</h1>
      <p className="text-sm text-text-muted max-w-sm">
        {description ?? 'Esta sección está en construcción. Muy pronto disponible.'}
      </p>
      <span className="mt-5 text-xs font-medium text-accent-700 bg-accent-50 border border-accent-200 rounded-full px-3 py-1">
        Próximamente
      </span>
    </div>
  )
}
