import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const [nutritionistName, setNutritionistName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/auth/register', {
        nutritionistName,
        businessName: businessName || null,
        email,
        password
      })
      setSuccess(res.data?.message || 'Te enviamos un email de confirmación.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al crear la cuenta')
    }
  }

  return (
    <div className="container container-narrow py-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="mb-3">Crear cuenta</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label">Nombre y apellido</label>
              <input
                className="form-control"
                value={nutritionistName}
                onChange={(e) => setNutritionistName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nombre del negocio (opcional)</label>
              <input
                className="form-control"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                className="form-control"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit">Crear cuenta</button>
          </form>
          <div className="mt-3">
            ¿Ya tenés cuenta? <Link to="/login">Ingresá acá</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
