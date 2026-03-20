import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const confirmedParam = useMemo(() => new URLSearchParams(location.search).get('confirmed'), [location.search])
  const reasonParam = useMemo(() => new URLSearchParams(location.search).get('reason'), [location.search])
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    if (confirmedParam === '1' || confirmedParam === '0') {
      const timer = setTimeout(() => setShowConfirmModal(true), 15000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [confirmedParam])

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
          {confirmedParam === '1' && (
            <div className="alert alert-success">Email confirmado. Ya podés ingresar.</div>
          )}
          {confirmedParam === '0' && (
            <div className="alert alert-danger">
              {reasonParam === 'expired'
                ? 'El token expiró. Solicitá un nuevo mail de confirmación.'
                : 'No se pudo validar el email. Intentá de nuevo.'}
            </div>
          )}
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
          <div className="mt-3">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </div>
      </div>
      {showConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Validación de email</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowConfirmModal(false)}>Cerrar</button>
            </div>
            <div className="modal-body">
              {confirmedParam === '1' ? (
                <div className="alert alert-success mb-0">Su mail fue validado con éxito.</div>
              ) : (
                <div className="alert alert-danger mb-0">
                  {reasonParam === 'expired'
                    ? 'El token expiró. Solicitá un nuevo mail de confirmación.'
                    : 'Falló la validación del mail. Token inválido.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
