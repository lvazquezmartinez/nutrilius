import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'
import Button from '@mui/material/Button'

export default function Settings() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const [insurances, setInsurances] = useState([])
  const [insuranceName, setInsuranceName] = useState('')
  const [templateJson, setTemplateJson] = useState('')
  const [settings, setSettings] = useState({ nutritionistName: '', businessName: '', licenseNumber: '', planType: 'BASIC', hasLogo: false })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    api.get('/insurances')
      .then((res) => setInsurances(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando obras sociales'))
    api.get('/anamnesis-template')
      .then((res) => setTemplateJson(res.data.templateJson))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando plantilla de anamnesis'))
    api.get('/settings')
      .then((res) => setSettings(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando configuración'))
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

  const saveSettings = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.put('/settings', {
        nutritionistName: settings.nutritionistName,
        businessName: settings.businessName,
        licenseNumber: settings.licenseNumber
      })
      setSettings(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando configuración')
    }
  }

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      await api.post('/settings/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      const res = await api.get('/settings')
      setSettings(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error subiendo logo')
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
        <div className="card-header">Datos del profesional</div>
        <div className="card-body">
          <form onSubmit={saveSettings} className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre completo</label>
              <input className="form-control" value={settings.nutritionistName || ''} onChange={(e) => setSettings({ ...settings, nutritionistName: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Nombre del negocio</label>
              <input className="form-control" value={settings.businessName || ''} onChange={(e) => setSettings({ ...settings, businessName: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Matrícula</label>
              <input className="form-control" value={settings.licenseNumber || ''} onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Logo (marca de agua)</label>
              <input className="form-control" type="file" accept="image/*" onChange={uploadLogo} />
              {settings.hasLogo && <div className="text-muted small mt-1">Logo cargado</div>}
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card mt-4">
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
