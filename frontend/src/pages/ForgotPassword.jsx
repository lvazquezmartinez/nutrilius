import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const res = await api.post('/auth/request-reset', { email })
      setMessage(res.data?.message || 'Si el correo existe, enviamos un link para recuperar la clave.')
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo enviar el email')
    }
  }

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="mb-3">Recuperar contraseña</h3>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit">Enviar link</button>
          </form>
          <div className="mt-3">
            <Link to="/login">Volver al login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
