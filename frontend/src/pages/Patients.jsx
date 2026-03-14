import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function Patients() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [patients, setPatients] = useState([])
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const load = (q = '') => {
    const params = q ? { params: { q } } : {}
    api.get('/patients', params)
      .then((res) => setPatients(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando pacientes'))
  }

  useEffect(() => {
    load(query)
  }, [query])

  return (
    <div>
      <BackButton />
      <h2 className="mb-3">Pacientes</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          <h5>Nuevo paciente</h5>
          <button className="btn btn-primary" onClick={() => navigate('/patients/new')}>Crear paciente</button>
          {user?.role === 'USER' && (
            <p className="text-muted mt-2">Los usuarios comunes pueden crear pacientes pero no editarlos.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5>Listado</h5>
          <div className="mb-3">
            <input
              className="form-control"
              placeholder="Buscar por nombre, apellido o DNI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul className="list-group">
            {patients.map((p) => (
              <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{p.fullName} {p.dni ? `- DNI: ${p.dni}` : ''}</span>
                <Link className="btn btn-outline-primary btn-sm" to={`/patients/${p.id}`}>Ver</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
