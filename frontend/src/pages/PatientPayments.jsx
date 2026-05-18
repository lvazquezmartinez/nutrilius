import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function PatientPayments() {
  const { id } = useParams()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [payments, setPayments] = useState([])
  const [insurances, setInsurances] = useState([])
  const [patient, setPatient] = useState(null)
  const toDateTimeLocal = (date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
  const [payment, setPayment] = useState({
    method: 'CASH',
    status: 'PAID',
    insuranceId: '',
    amount: '',
    paidAt: toDateTimeLocal(new Date()),
    dueAt: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    api.get(`/patients/${id}`).then((res) => setPatient(res.data))
    api.get(`/patients/${id}/payments`).then((res) => setPayments(res.data))
    api.get('/insurances').then((res) => setInsurances(res.data))
  }, [id, user?.role])

  if (user?.role !== 'ADMIN') {
    return <div className="alert alert-info">Acceso solo para administradores.</div>
  }

  const submitPayment = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/patients/${id}/payments`, {
        method: payment.method,
        status: payment.status,
        insuranceId: payment.method === 'INSURANCE' ? Number(payment.insuranceId) : null,
        amount: Number(payment.amount),
        paidAt: payment.status === 'PAID' ? (payment.paidAt || null) : null,
        dueAt: payment.status !== 'PAID' ? (payment.dueAt || null) : null
      })
      setPayment({ method: 'CASH', status: 'PAID', insuranceId: '', amount: '', paidAt: toDateTimeLocal(new Date()), dueAt: '' })
      const res = await api.get(`/patients/${id}/payments`)
      setPayments(res.data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando pago')
    }
  }

  return (
    <div>
      <BackButton />
      <h2 className="mb-3">Pagos del paciente {patient?.fullName || `#${id}`}</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-header bg-warning">Registrar pago</div>
        <div className="card-body">
          <form onSubmit={submitPayment} className="row g-2">
            <div className="col-md-3">
              <select className="form-select" value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}>
                <option value="CASH">Efectivo</option>
                <option value="CARD">Tarjeta</option>
                <option value="INSURANCE">Obra social</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={payment.status} onChange={(e) => setPayment({ ...payment, status: e.target.value })}>
                <option value="PAID">Pagado</option>
                <option value="PENDING">Pendiente</option>
                <option value="OVERDUE">Vencido</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={payment.insuranceId} onChange={(e) => setPayment({ ...payment, insuranceId: e.target.value })} disabled={payment.method !== 'INSURANCE'}>
                <option value="">Obra social</option>
                {insurances.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="Monto" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
            </div>
            <div className="col-md-3">
              <input
                className="form-control"
                type="datetime-local"
                value={payment.status === 'PAID' ? payment.paidAt : payment.dueAt}
                onChange={(e) => setPayment({
                  ...payment,
                  paidAt: payment.status === 'PAID' ? e.target.value : payment.paidAt,
                  dueAt: payment.status !== 'PAID' ? e.target.value : payment.dueAt
                })}
              />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" type="submit">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Historial de pagos</div>
        <div className="card-body">
          <ul className="list-group">
            {payments.map((p) => (
              <li key={p.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{p.method}</strong> - ${p.amount}
                    <div className="text-muted small">
                      Estado: {p.status}
                      {p.paidAt ? ` | Pagado: ${new Date(p.paidAt).toLocaleString()}` : ''}
                      {p.dueAt ? ` | Vence: ${new Date(p.dueAt).toLocaleString()}` : ''}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
