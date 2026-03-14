import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'
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
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5>Pacientes</h5>
                <p className="display-6">{data.patients}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5>Visitas</h5>
                <p className="display-6">{data.visits}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5>Pagos (total)</h5>
                <p className="display-6">${data.paymentsTotal}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
