import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function formatVisitStatus(status) {
  switch (status) {
    case 'SCHEDULED':
      return 'Programada'
    case 'CONFIRMED':
      return 'Confirmada'
    case 'COMPLETED':
      return 'Completada'
    case 'CANCELED':
      return 'Cancelada'
    default:
      return status || '-'
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-success-subtle text-success-emphasis'
    case 'COMPLETED':
      return 'bg-primary-subtle text-primary-emphasis'
    case 'CANCELED':
      return 'bg-danger-subtle text-danger-emphasis'
    default:
      return 'bg-warning-subtle text-warning-emphasis'
  }
}

function buildGoogleCalendarUrl(visit) {
  const scheduledAt = visit?.scheduledAt ? new Date(visit.scheduledAt) : null
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return '#'
  const end = new Date(scheduledAt.getTime() + (Number(visit.durationMinutes || 45) * 60000))
  const format = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Consulta nutricional - ${visit.patientName || 'Paciente'}`,
    dates: `${format(scheduledAt)}/${format(end)}`,
    details: visit.notes || 'Turno generado desde Nutrilius'
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export default function Calendar() {
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const [visits, setVisits] = useState([])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    api.get('/patients')
      .then(async (res) => {
        const patients = res.data || []
        const visitResponses = await Promise.all(
          patients.map(async (patient) => {
            const visitRes = await api.get(`/patients/${patient.id}/visits`)
            return (visitRes.data || []).map((visit) => ({
              ...visit,
              patientId: patient.id,
              patientName: patient.fullName
            }))
          })
        )
        const merged = visitResponses
          .flat()
          .sort((a, b) => new Date(a.scheduledAt || a.visitDate).getTime() - new Date(b.scheduledAt || b.visitDate).getTime())
        setVisits(merged)
      })
      .catch((err) => setError(err?.response?.data?.error || 'Error cargando calendario'))
  }, [])

  const filteredVisits = visits.filter((visit) => {
    if (statusFilter === 'ALL') return true
    return visit.status === statusFilter
  })

  const groupedVisits = filteredVisits.reduce((acc, visit) => {
    const key = visit.scheduledAt
      ? new Date(visit.scheduledAt).toLocaleDateString()
      : (visit.visitDate || 'Sin fecha')
    if (!acc[key]) acc[key] = []
    acc[key].push(visit)
    return acc
  }, {})

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Calendario</h2>
          <div className="text-muted">Agenda general del consultorio</div>
        </div>
        <div style={{ minWidth: 220 }}>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos los estados</option>
            <option value="SCHEDULED">Programadas</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="COMPLETED">Completadas</option>
            <option value="CANCELED">Canceladas</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {Object.keys(groupedVisits).length === 0 ? (
        <div className="card">
          <div className="card-body text-muted">No hay turnos cargados para mostrar.</div>
        </div>
      ) : (
        Object.entries(groupedVisits).map(([date, dayVisits]) => (
          <div key={date} className="card">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <strong>{date}</strong>
              <span className="text-muted small">{dayVisits.length} turno(s)</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>Estado</th>
                      <th>Duración</th>
                      <th>Notas</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((visit) => (
                      <tr key={visit.id}>
                        <td>{visit.scheduledAt ? new Date(visit.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                        <td>
                          <div className="fw-semibold">{visit.patientName}</div>
                          <div className="text-muted small">#{visit.patientId}</div>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${statusBadgeClass(visit.status)}`}>
                            {formatVisitStatus(visit.status)}
                          </span>
                        </td>
                        <td>{visit.durationMinutes || 45} min</td>
                        <td className="text-muted small">{visit.notes || 'Sin notas'}</td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <Link className="btn btn-outline-primary btn-sm" to={`/patients/${visit.patientId}`}>
                              Ver paciente
                            </Link>
                            <a className="btn btn-outline-secondary btn-sm" href={buildGoogleCalendarUrl(visit)} target="_blank" rel="noreferrer">
                              Google Calendar
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
