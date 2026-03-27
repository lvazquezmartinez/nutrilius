import React, { useEffect, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function SuperAdmin() {
  const user = React.useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const [tenants, setTenants] = useState([])
  const [error, setError] = useState('')
  const [passwords, setPasswords] = useState({})
  const [confirmTenant, setConfirmTenant] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [daysRange, setDaysRange] = useState(30)

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return
    api.get('/super/tenants')
      .then((res) => setTenants(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando tenants'))
    api.get(`/super/analytics?days=${daysRange}`)
      .then((res) => setAnalytics(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando analíticas'))
  }, [user?.role, daysRange])

  if (user?.role !== 'SUPER_ADMIN') {
    return <div className="alert alert-info">Acceso solo para super admin.</div>
  }

  return (
    <div>
      <BackButton />
      <h2 className="mb-3">Analíticas de uso</h2>
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <p className="text-muted mb-0">Últimos {daysRange} días</p>
            <select
              className="form-select form-select-sm w-auto"
              value={daysRange}
              onChange={(e) => setDaysRange(Number(e.target.value))}
            >
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
            </select>
          </div>
          <div className="row g-3">
            <div className="col-6 col-lg-3">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Usuarios nuevos</div>
                <div className="fs-4 fw-bold">{analytics?.newUsersLast30Days ?? '-'}</div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Tenants nuevos</div>
                <div className="fs-4 fw-bold">{analytics?.newTenantsLast30Days ?? '-'}</div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Usuarios totales</div>
                <div className="fs-4 fw-bold">{analytics?.totalUsers ?? '-'}</div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Tenants totales</div>
                <div className="fs-4 fw-bold">{analytics?.totalTenants ?? '-'}</div>
              </div>
            </div>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-6 col-lg-4">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Pacientes totales</div>
                <div className="fs-4 fw-bold">{analytics?.totalPatients ?? '-'}</div>
              </div>
            </div>
            <div className="col-6 col-lg-4">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Visitas totales</div>
                <div className="fs-4 fw-bold">{analytics?.totalVisits ?? '-'}</div>
              </div>
            </div>
            <div className="col-6 col-lg-4">
              <div className="border rounded p-3 h-100">
                <div className="text-muted">Pagos totales</div>
                <div className="fs-4 fw-bold">{analytics?.totalPayments ?? '-'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-5">
        <div className="card-body">
          <h5 className="mb-3">Módulos más usados (últimos 30 días)</h5>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Módulo</th>
                  <th>Actividad</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.modulesLast30Days?.length ? (
                  analytics.modulesLast30Days.map((m) => (
                    <tr key={m.module}>
                      <td>{m.module}</td>
                      <td className="fw-semibold">{m.count}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-muted">Sin datos.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2 className="mb-3">Negocios (tenants)</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="card-body">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Admin</th>
                <th>Tipo</th>
                <th>Activa</th>
                <th>Alta</th>
                <th>Baja</th>
                <th>Usuarios</th>
                <th>Pacientes</th>
                <th>Visitas</th>
                <th>Acciones</th>
                <th>Reset clave</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.adminEmail || '-'}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={t.planType || 'BASIC'}
                      onChange={async (e) => {
                        try {
                          const res = await api.put(`/super/tenants/${t.id}/plan`, { planType: e.target.value })
                          setTenants((prev) => prev.map((x) => (x.id === t.id ? res.data : x)))
                        } catch (err) {
                          setError(err?.response?.data?.error || 'Error actualizando plan')
                        }
                      }}
                    >
                      <option value="BASIC">BASIC</option>
                      <option value="PRO">PRO</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </td>
                  <td>{t.active ? 'Si' : 'No'}</td>
                  <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td>
                  <td>{t.deactivatedAt ? new Date(t.deactivatedAt).toLocaleDateString() : '-'}</td>
                  <td>{t.users}</td>
                  <td>{t.patients}</td>
                  <td>{t.visits}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmTenant(t)}>
                      {t.active ? 'Dar de baja' : 'Reactivar'}
                    </button>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <input
                        className="form-control form-control-sm"
                        type="password"
                        placeholder="Nueva clave"
                        value={passwords[t.id] || ''}
                        onChange={(e) => setPasswords((prev) => ({ ...prev, [t.id]: e.target.value }))}
                      />
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={async () => {
                          if (!passwords[t.id]) {
                            setError('Ingresá una nueva clave')
                            return
                          }
                          try {
                            await api.post(`/super/tenants/${t.id}/reset-password`, { newPassword: passwords[t.id] || '' })
                            setPasswords((prev) => ({ ...prev, [t.id]: '' }))
                          } catch (err) {
                            setError(err?.response?.data?.error || 'Error reseteando clave')
                          }
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {confirmTenant && (
        <div className="modal-backdrop" onClick={() => setConfirmTenant(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Confirmación</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmTenant(null)}>Cerrar</button>
            </div>
            <div className="modal-body">
              ¿Seguro que querés {confirmTenant.active ? 'dar de baja' : 'reactivar'} el tenant <strong>{confirmTenant.name}</strong>?
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={() => setConfirmTenant(null)}>Cancelar</button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    const res = await api.post(`/super/tenants/${confirmTenant.id}/toggle`)
                    setTenants((prev) => prev.map((x) => (x.id === confirmTenant.id ? res.data : x)))
                    setConfirmTenant(null)
                  } catch (err) {
                    setError(err?.response?.data?.error || 'Error actualizando tenant')
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
