import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'
import Button from '@mui/material/Button'

export default function Settings() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const [insurances, setInsurances] = useState([])
  const [insuranceName, setInsuranceName] = useState('')
  const [templateJson, setTemplateJson] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    api.get('/insurances')
      .then((res) => setInsurances(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando obras sociales'))
    api.get('/anamnesis-template')
      .then((res) => setTemplateJson(res.data.templateJson))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando plantilla de anamnesis'))
  }, [user?.role])

  if (user?.role !== 'ADMIN') {
    return <div className="alert alert-info">Acceso solo para administradores.</div>
  }

  const createInsurance = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/insurances', { name: insuranceName })
      setInsuranceName('')
      const res = await api.get('/insurances')
      setInsurances(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error creando obra social')
    }
  }

  const toggleInsurance = async (insurance) => {
    setError('')
    try {
      await api.put(`/insurances/${insurance.id}`, { active: !insurance.active })
      const res = await api.get('/insurances')
      setInsurances(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error actualizando obra social')
    }
  }

  const saveTemplate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      JSON.parse(templateJson)
      await api.put('/anamnesis-template', { templateJson })
    } catch (err) {
      setError(err?.response?.data?.error || 'Plantilla inválida')
    }
  }

  const resetTemplate = async () => {
    setError('')
    try {
      const res = await api.post('/anamnesis-template/reset')
      setTemplateJson(res.data.templateJson)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error restaurando plantilla')
    }
  }

  return (
    <div>
      <BackButton />
      <h2 className="mb-3">Configuración</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="card-header">Obras sociales</div>
        <div className="card-body">
          <form onSubmit={createInsurance} className="row g-2 mb-3">
            <div className="col-md-8">
              <input className="form-control" placeholder="Nueva obra social" value={insuranceName} onChange={(e) => setInsuranceName(e.target.value)} />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" type="submit">Agregar</button>
            </div>
          </form>
          <ul className="list-group">
            {insurances.map((i) => (
              <li key={i.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{i.name} {i.active ? '' : '(inactiva)'}</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => toggleInsurance(i)}>
                  {i.active ? 'Desactivar' : 'Activar'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">Plantilla de anamnesis (por cliente)</div>
        <div className="card-body">
          <form onSubmit={saveTemplate}>
            <textarea
              className="form-control"
              rows="16"
              value={templateJson}
              onChange={(e) => setTemplateJson(e.target.value)}
            />
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" type="submit">Guardar plantilla</button>
              <Button variant="outlined" color="warning" onClick={resetTemplate}>Restaurar a base</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
