import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'

function toDateTimeLocal(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function PublicBooking() {
  const { slug } = useParams()
  const [info, setInfo] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    scheduledAt: toDateTimeLocal(new Date(Date.now() + 86400000)),
    durationMinutes: '45',
    notes: ''
  })

  useEffect(() => {
    api.get(`/public/booking/${slug}`)
      .then((res) => setInfo(res.data))
      .catch((err) => setError(err?.response?.data?.error || 'Link de turnos no disponible'))
  }, [slug])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await api.post(`/public/booking/${slug}`, {
        dni: form.dni,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        scheduledAt: form.scheduledAt,
        durationMinutes: Number(form.durationMinutes || 45),
        notes: form.notes
      })
      setSuccess(
        res.data.existingPatient
          ? 'Turno reservado. Identificamos tu paciente por DNI y sumamos la visita.'
          : 'Turno reservado. Te registramos como paciente nuevo hasta la primera consulta.'
      )
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo reservar el turno')
    }
  }

  return (
    <div className="landing-root">
      <section className="landing-section" style={{ maxWidth: 900, margin: '0 auto', paddingTop: '4rem' }}>
        <div className="landing-section-header">
          <h2>{info?.businessName || info?.nutritionistName || 'Reservar turno'}</h2>
          <p>
            {info?.nutritionistName ? `Agenda de ${info.nutritionistName}.` : 'Completá tus datos para reservar un turno.'}
            {' '}Usamos tu DNI para encontrarte. Si no existís todavía, te damos de alta como paciente nuevo.
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={submit} className="row g-3">
              <div className="col-md-4">
                <label className="form-label">DNI</label>
                <input className="form-control" value={form.dni} onChange={(e) => update('dni', e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input className="form-control" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Apellido</label>
                <input className="form-control" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <input className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha y hora</label>
                <input className="form-control" type="datetime-local" value={form.scheduledAt} onChange={(e) => update('scheduledAt', e.target.value)} required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Duración</label>
                <select className="form-select" value={form.durationMinutes} onChange={(e) => update('durationMinutes', e.target.value)}>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label">Motivo / notas</label>
                <textarea className="form-control" rows="3" value={form.notes} onChange={(e) => update('notes', e.target.value)} />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Reservar turno</button>
                <Link className="btn btn-outline-secondary" to="/">Volver</Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
