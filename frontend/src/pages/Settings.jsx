import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

export default function Settings() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const [insurances, setInsurances] = useState([])
  const [insuranceName, setInsuranceName] = useState('')
  const [templateJson, setTemplateJson] = useState('')
  const [settings, setSettings] = useState({ nutritionistName: '', businessName: '', licenseNumber: '', planType: 'BASIC', hasLogo: false })
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'USER' })
  const [planTemplates, setPlanTemplates] = useState([])
  const [planTemplateForm, setPlanTemplateForm] = useState({ id: null, name: '', contentText: '' })

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
    api.get('/users')
      .then((res) => setUsers(res.data))
      .catch(() => {})
    api.get('/plan-templates')
      .then((res) => setPlanTemplates(res.data))
      .catch(() => {})
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

  const createUser = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/users', newUser)
      setUsers([res.data, ...users])
      setNewUser({ email: '', password: '', role: 'USER' })
    } catch (err) {
      setError(err?.response?.data?.error || 'Error creando usuario')
    }
  }

  const toggleUser = async (u) => {
    setError('')
    try {
      const res = await api.post(`/users/${u.id}/toggle`)
      setUsers(users.map((item) => (item.id === u.id ? res.data : item)))
    } catch (err) {
      setError(err?.response?.data?.error || 'Error actualizando usuario')
    }
  }

  const resetUserPassword = async (u) => {
    setError('')
    try {
      await api.post(`/users/${u.id}/send-reset`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error reseteando clave')
    }
  }

  const savePlanTemplate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (planTemplateForm.id) {
        const res = await api.put(`/plan-templates/${planTemplateForm.id}`, {
          name: planTemplateForm.name,
          contentText: planTemplateForm.contentText
        })
        setPlanTemplates(planTemplates.map((t) => (t.id === res.data.id ? res.data : t)))
      } else {
        const res = await api.post('/plan-templates', {
          name: planTemplateForm.name,
          contentText: planTemplateForm.contentText
        })
        setPlanTemplates([res.data, ...planTemplates])
      }
      setPlanTemplateForm({ id: null, name: '', contentText: '' })
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando plantilla de plan')
    }
  }

  const editPlanTemplate = (tpl) => {
    setPlanTemplateForm({ id: tpl.id, name: tpl.name, contentText: tpl.contentText })
  }

  const deletePlanTemplate = async (tpl) => {
    setError('')
    try {
      await api.delete(`/plan-templates/${tpl.id}`)
      setPlanTemplates(planTemplates.filter((t) => t.id !== tpl.id))
      if (planTemplateForm.id === tpl.id) {
        setPlanTemplateForm({ id: null, name: '', contentText: '' })
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Error eliminando plantilla')
    }
  }

  return (
    <div>
      <BackButton />
      <h2 className="mb-3">Configuración</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-3">
        <Tab label="General" />
        <Tab label="Usuarios" />
      </Tabs>

      {tab === 0 && (
        <>
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

          <div className="card mt-4">
            <div className="card-header">Plantillas de planes</div>
            <div className="card-body">
              <form onSubmit={savePlanTemplate} className="mb-3">
                <div className="row g-2">
                  <div className="col-md-4">
                    <input
                      className="form-control"
                      placeholder="Nombre de la plantilla"
                      value={planTemplateForm.name}
                      onChange={(e) => setPlanTemplateForm({ ...planTemplateForm, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-8">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Contenido base del plan"
                      value={planTemplateForm.contentText}
                      onChange={(e) => setPlanTemplateForm({ ...planTemplateForm, contentText: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-2 d-flex gap-2">
                  <button className="btn btn-primary" type="submit">
                    {planTemplateForm.id ? 'Actualizar plantilla' : 'Guardar plantilla'}
                  </button>
                  {planTemplateForm.id && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => setPlanTemplateForm({ id: null, name: '', contentText: '' })}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Contenido</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {planTemplates.map((tpl) => (
                      <tr key={tpl.id}>
                        <td>{tpl.name}</td>
                        <td className="text-truncate" style={{ maxWidth: 320 }}>{tpl.contentText}</td>
                        <td className="d-flex gap-2">
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => editPlanTemplate(tpl)}>Editar</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => deletePlanTemplate(tpl)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 1 && (
        <>
          <div className="card">
            <div className="card-header">Crear usuario</div>
            <div className="card-body">
              <form onSubmit={createUser} className="row g-2">
                <div className="col-md-5">
                  <input className="form-control" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input className="form-control" type="password" placeholder="Contraseña" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <select className="form-select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary w-100" type="submit">Crear</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">Usuarios</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{u.active ? 'Activo' : 'Inactivo'}</td>
                        <td className="d-flex gap-2">
                          <button className="btn btn-outline-secondary btn-sm" onClick={() => resetUserPassword(u)}>Enviar reset</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => toggleUser(u)} disabled={u.role === 'ADMIN'}>
                            {u.active ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
