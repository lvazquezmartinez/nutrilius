import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const confirmed = useMemo(() => new URLSearchParams(location.search).get('confirmed') === '1', [location.search])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify({
        userId: res.data.userId,
        tenantId: res.data.tenantId,
        email: res.data.email,
        role: res.data.role
      }))
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="mb-3">Ingreso</h3>
          {confirmed && <div className="alert alert-success">Email confirmado. Ya podés ingresar.</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">Entrar</button>
          </form>
        </div>
      </div>
    </div>
  )
}
