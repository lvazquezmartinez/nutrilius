import React, { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search])
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const res = await api.post('/auth/reset', { token, password })
      setMessage(res.data?.message || 'Contraseña actualizada.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err?.response?.data?.error || 'No se pudo actualizar la contraseña')
    }
  }

  if (!token) {
    return (
      <div className="container container-narrow py-5">
        <div className="alert alert-danger">Link inválido.</div>
        <Link to="/login">Volver al login</Link>
      </div>
    )
  }

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="mb-3">Nueva contraseña</h3>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Contraseña nueva</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit">Actualizar</button>
          </form>
          <div className="mt-3">
            <Link to="/login">Volver al login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
