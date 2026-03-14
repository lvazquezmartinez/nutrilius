import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function PatientCreate() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    sex: '',
    notes: ''
  })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, birthDate: form.birthDate || null }
      const res = await api.post('/patients', payload)
      navigate(`/patients/${res.data.id}`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error creando paciente')
    }
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  return (
    <div>
      <BackButton />
      <h2 className="mb-3">Nuevo paciente</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Nombre/s</label>
                <input className="form-control" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Apellido/s</label>
                <input className="form-control" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">DNI</label>
                <input className="form-control" value={form.dni} onChange={(e) => update('dni', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha de nacimiento</label>
                <input className="form-control" type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Sexo</label>
                <input className="form-control" value={form.sex} onChange={(e) => update('sex', e.target.value)} />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Domicilio</label>
              <input className="form-control" value={form.address} onChange={(e) => update('address', e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Observaciones</label>
              <textarea className="form-control" rows="3" value={form.notes} onChange={(e) => update('notes', e.target.value)}></textarea>
            </div>

            <button className="btn btn-primary" type="submit">Crear paciente</button>
          </form>
        </div>
      </div>
    </div>
  )
}
