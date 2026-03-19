import React, { useEffect, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function SuperAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [tenants, setTenants] = useState([])
  const [error, setError] = useState('')
  const [passwords, setPasswords] = useState({})

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return
    api.get('/super/tenants')
      .then((res) => setTenants(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando tenants'))
  }, [user])

  if (user?.role !== 'SUPER_ADMIN') {
    return <div className="alert alert-info">Acceso solo para super admin.</div>
  }

  return (
    <div>
      <BackButton />
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
                <th>Usuarios</th>
                <th>Pacientes</th>
                <th>Visitas</th>
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
                  <td>{t.users}</td>
                  <td>{t.patients}</td>
                  <td>{t.visits}</td>
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
    </div>
  )
}
