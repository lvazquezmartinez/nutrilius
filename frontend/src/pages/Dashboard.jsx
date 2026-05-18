import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import Button from '@mui/material/Button'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function Dashboard() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const loadDashboard = () => {
    if (user?.role !== 'ADMIN') return
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando dashboard'))
  }

  useEffect(() => {
    loadDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role])

  if (user?.role !== 'ADMIN') {
    return <div className="alert alert-info">El dashboard está disponible solo para administradores.</div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Dashboard</h2>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadDashboard}>
          Recargar
        </Button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {data && (
        <>
        <div className="row g-3">
          <div className="col-md-3">
            <Link to="/patients" className="text-decoration-none text-reset d-block">
            <div className="card">
              <div className="card-body">
                <h5>Pacientes</h5>
                <p className="display-6">{data.patients}</p>
                <span className="btn btn-outline-primary btn-sm">Ver pacientes</span>
              </div>
            </div>
            </Link>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5>Visitas</h5>
                <p className="display-6">{data.visits}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5>Próximos turnos</h5>
                <p className="display-6">{data.upcomingVisits}</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h5>Pagos (total)</h5>
                <p className="display-6">${data.paymentsTotal}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-3 mt-1">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5>Pagos pendientes</h5>
                <p className="display-6">${data.pendingPaymentsTotal}</p>
                <div className="text-muted">{data.overduePayments} vencidos</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5>Próximas visitas</h5>
                {data.nextVisits?.length ? (
                  <ul className="list-group list-group-flush">
                    {data.nextVisits.map((visit) => (
                      <li key={visit.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div>
                          <div className="fw-semibold">{visit.patientName}</div>
                          <div className="text-muted small">{new Date(visit.scheduledAt).toLocaleString()}</div>
                        </div>
                        <Link className="btn btn-outline-primary btn-sm" to={`/patients/${visit.patientId}`}>
                          Ver
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">No hay turnos próximos.</div>
                )}
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
