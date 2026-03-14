import React, { useEffect, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function SuperAdmin() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [tenants, setTenants] = useState([])
  const [error, setError] = useState('')

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
                <th>Activa</th>
                <th>Usuarios</th>
                <th>Pacientes</th>
                <th>Visitas</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.active ? 'Si' : 'No'}</td>
                  <td>{t.users}</td>
                  <td>{t.patients}</td>
                  <td>{t.visits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
