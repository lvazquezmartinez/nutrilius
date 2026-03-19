import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/client'
import BackButton from '../components/BackButton.jsx'

export default function PatientDetail() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [anamnesisTemplate, setAnamnesisTemplate] = useState(null)
  const [anamnesisData, setAnamnesisData] = useState({})
  const [anamnesisList, setAnamnesisList] = useState([])
  const [visits, setVisits] = useState([])
  const toDateInput = (d) => d.toISOString().slice(0, 10)
  const toDateTimeLocal = (d) => d.toISOString().slice(0, 16)

  const [visitDate, setVisitDate] = useState(toDateInput(new Date()))
  const [visitNotes, setVisitNotes] = useState('')
  const [metrics, setMetrics] = useState([])
  const [metricForm, setMetricForm] = useState({
    measuredAt: toDateTimeLocal(new Date()),
    weightKg: '',
    heightM: '',
    bmi: '',
    waistCm: '',
    neckCm: ''
  })
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [editPatient, setEditPatient] = useState(null)
  const [evolutions, setEvolutions] = useState([])
  const [evolutionText, setEvolutionText] = useState('')
  const [showAnamnesisModal, setShowAnamnesisModal] = useState(false)
  const [selectedAnamnesis, setSelectedAnamnesis] = useState(null)
  const [editAnamnesisMode, setEditAnamnesisMode] = useState(false)
  const [selectedAnamnesisData, setSelectedAnamnesisData] = useState({})
  const [settings, setSettings] = useState({ planType: 'BASIC' })
  const [planText, setPlanText] = useState('')
  const [showPlanPdf, setShowPlanPdf] = useState(false)
  const [planPdfUrl, setPlanPdfUrl] = useState('')
  const [planNotes, setPlanNotes] = useState('')
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '', chartKey: null })

  const loadAll = () => {
    api.get(`/patients/${id}`).then((res) => {
      setPatient(res.data)
      setEditPatient(res.data)
    })
    api.get(`/patients/${id}/anamneses`).then((res) => setAnamnesisList(res.data))
    api.get(`/patients/${id}/visits`).then((res) => setVisits(res.data))
    api.get(`/patients/${id}/metrics`).then((res) => setMetrics(res.data))
    api.get('/anamnesis-template').then((res) => setAnamnesisTemplate(JSON.parse(res.data.templateJson)))
    api.get(`/patients/${id}/evolutions`).then((res) => setEvolutions(res.data))
    api.get('/settings').then((res) => setSettings(res.data)).catch(() => {})
    api.get(`/patients/${id}/plan`).then((res) => {
      if (res.data) setPlanText(res.data.contentText || '')
    }).catch(() => {})
  }

  useEffect(() => {
    setVisitDate(toDateInput(new Date()))
    loadAll()
  }, [id])

  const submitAnamnesis = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/patients/${id}/anamneses`, {
        data: anamnesisData
      })
      setAnamnesisData({})
      loadAll()
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando anamnesis')
    }
  }

  const renderTemplateField = (field) => {
    const value = anamnesisData[field.key] || ''
    const setValue = (val) => setAnamnesisData((prev) => ({ ...prev, [field.key]: val }))
    if (field.type === 'textarea') {
      const isComments = field.key === 'comentarios_finales' || field.key === 'comentarios' || (field.label || '').toLowerCase().includes('comentario')
      return (
        <textarea className="form-control" rows={isComments ? 6 : 2} value={value} onChange={(e) => setValue(e.target.value)}></textarea>
      )
    }
    return (
      <input className="form-control" value={value} onChange={(e) => setValue(e.target.value)} />
    )
  }

  const renderSelectedField = (field) => {
    const value = selectedAnamnesisData[field.key] || ''
    const setValue = (val) => setSelectedAnamnesisData((prev) => ({ ...prev, [field.key]: val }))
    if (field.type === 'textarea') {
      const isComments = field.key === 'comentarios_finales' || field.key === 'comentarios' || (field.label || '').toLowerCase().includes('comentario')
      return editAnamnesisMode ? (
        <textarea className="form-control" rows={isComments ? 6 : 2} value={value} onChange={(e) => setValue(e.target.value)}></textarea>
      ) : (
        <div className="form-control-plaintext">{value || '-'}</div>
      )
    }
    return editAnamnesisMode ? (
      <input className="form-control" value={value} onChange={(e) => setValue(e.target.value)} />
    ) : (
      <div className="form-control-plaintext">{value || '-'}</div>
    )
  }

  const submitVisit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/patients/${id}/visits`, {
        visitDate: visitDate || null,
        notes: visitNotes
      })
      setVisitDate(toDateInput(new Date()))
      setVisitNotes('')
      loadAll()
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando visita')
    }
  }

  const submitEvolution = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/patients/${id}/evolutions`, { notes: evolutionText })
      setEvolutionText('')
      loadAll()
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando evolución')
    }
  }

  const submitMetric = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post(`/patients/${id}/metrics`, {
        measuredAt: metricForm.measuredAt || null,
        weightKg: metricForm.weightKg ? Number(metricForm.weightKg) : null,
        heightM: metricForm.heightM ? Number(metricForm.heightM) : null,
        bmi: metricForm.bmi ? Number(metricForm.bmi) : null,
        waistCm: metricForm.waistCm ? Number(metricForm.waistCm) : null,
        neckCm: metricForm.neckCm ? Number(metricForm.neckCm) : null
      })
      setMetricForm({ measuredAt: toDateTimeLocal(new Date()), weightKg: '', heightM: '', bmi: '', waistCm: '', neckCm: '' })
      loadAll()
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando métricas')
    }
  }

  const savePlan = async () => {
    setError('')
    try {
      await api.put(`/patients/${id}/plan`, { contentText: planText })
    } catch (err) {
      setError(err?.response?.data?.error || 'Error guardando plan')
    }
  }

  const generatePlan = async () => {
    setError('')
    setIsGeneratingPlan(true)
    try {
      const res = await api.post(`/patients/${id}/plan/generate`, { notes: planNotes })
      setPlanText(res.data?.contentText || '')
    } catch (err) {
      setError(err?.response?.data?.error || 'Error generando plan con IA')
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const openPlanPdf = async () => {
    setError('')
    try {
      const res = await api.get(`/patients/${id}/plan/pdf`, { responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      setPlanPdfUrl(url)
      setShowPlanPdf(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Error generando PDF')
    }
  }

  const closePlanPdf = () => {
    if (planPdfUrl) {
      window.URL.revokeObjectURL(planPdfUrl)
    }
    setPlanPdfUrl('')
    setShowPlanPdf(false)
  }

  const renderLineChart = (label, key, unit) => {
    const points = metrics
      .filter((m) => m[key] !== null && m[key] !== undefined)
      .map((m) => ({ x: new Date(m.measuredAt).getTime(), y: Number(m[key]) }))

    if (points.length < 2) {
      return (
        <div className="mb-3">
          <strong>{label}</strong>
          <div className="text-muted">No hay suficientes datos para el gráfico.</div>
        </div>
      )
    }

    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxY = Math.max(...points.map((p) => p.y))

    const width = 600
    const height = 140
    const pad = 10

    const scaleX = (x) => pad + ((x - minX) / (maxX - minX || 1)) * (width - pad * 2)
    const scaleY = (y) => height - pad - ((y - minY) / (maxY - minY || 1)) * (height - pad * 2)

    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
      .join(' ')

    return (
      <div className="mb-3 position-relative">
        <strong>{label}</strong>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="border rounded w-100">
          <path d={path} fill="none" stroke="#0d6efd" strokeWidth="2" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r="4" fill="#0d6efd">
                <title>{`${new Date(p.x).toLocaleString()} - ${p.y}${unit}`}</title>
              </circle>
              <circle
                cx={scaleX(p.x)}
                cy={scaleY(p.y)}
                r="12"
                fill="transparent"
                pointerEvents="all"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
                  setTooltip({
                    visible: true,
                    x: e.clientX - rect.left + 10,
                    y: e.clientY - rect.top + 10,
                    text: `${new Date(p.x).toLocaleString()} - ${p.y}${unit}`,
                    chartKey: key
                  })
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
                  setTooltip((t) => ({
                    ...t,
                    x: e.clientX - rect.left + 10,
                    y: e.clientY - rect.top + 10
                  }))
                }}
                onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, text: '', chartKey: null })}
              />
            </g>
          ))}
        </svg>
        {tooltip.visible && tooltip.chartKey === key && (
          <div
            className="chart-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
        <div className="text-muted small">Min {minY}{unit} / Max {maxY}{unit}</div>
      </div>
    )
  }

  const isPatientComplete = (p) => {
    if (!p) return false
    const required = [p.firstName, p.lastName, p.dni, p.birthDate, p.phone, p.email, p.address, p.sex]
    return required.every((v) => String(v || '').trim().length > 0)
  }

  return (
    <div>
      <BackButton />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Paciente {patient?.fullName || `#${id}`}</h2>
        {user?.role === 'ADMIN' && (
          <Link className="btn btn-outline-warning" to={`/patients/${id}/payments`}>Pagos</Link>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {user?.role === 'ADMIN' && editPatient && (
        <details className="card" open={!isPatientComplete(editPatient)}>
          <summary className="card-header">Datos del paciente</summary>
          <div className="card-body">
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setError('')
                try {
                  await api.put(`/patients/${id}`, {
                    firstName: editPatient.firstName || '',
                    lastName: editPatient.lastName || '',
                    dni: editPatient.dni || '',
                    birthDate: editPatient.birthDate || null,
                    phone: editPatient.phone || '',
                    email: editPatient.email || '',
                    address: editPatient.address || '',
                    sex: editPatient.sex || '',
                    notes: editPatient.notes || ''
                  })
                  loadAll()
                } catch (err) {
                  setError(err?.response?.data?.error || 'Error actualizando paciente')
                }
              }}
            >
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre/s</label>
                  <input className="form-control" value={editPatient.firstName || ''} onChange={(e) => setEditPatient({ ...editPatient, firstName: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Apellido/s</label>
                  <input className="form-control" value={editPatient.lastName || ''} onChange={(e) => setEditPatient({ ...editPatient, lastName: e.target.value })} />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">DNI</label>
                  <input className="form-control" value={editPatient.dni || ''} onChange={(e) => setEditPatient({ ...editPatient, dni: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha de nacimiento</label>
                  <input className="form-control" type="date" value={editPatient.birthDate || ''} onChange={(e) => setEditPatient({ ...editPatient, birthDate: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sexo</label>
                  <input className="form-control" value={editPatient.sex || ''} onChange={(e) => setEditPatient({ ...editPatient, sex: e.target.value })} />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input className="form-control" value={editPatient.phone || ''} onChange={(e) => setEditPatient({ ...editPatient, phone: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={editPatient.email || ''} onChange={(e) => setEditPatient({ ...editPatient, email: e.target.value })} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Domicilio</label>
                <input className="form-control" value={editPatient.address || ''} onChange={(e) => setEditPatient({ ...editPatient, address: e.target.value })} />
              </div>

              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea className="form-control" rows="3" value={editPatient.notes || ''} onChange={(e) => setEditPatient({ ...editPatient, notes: e.target.value })}></textarea>
              </div>

              <button className="btn btn-primary" type="submit">Guardar cambios</button>
            </form>
          </div>
        </details>
      )}

      {anamnesisTemplate && anamnesisList.length === 0 && (
        <details className="card" open>
          <summary className="card-header bg-secondary text-white">Anamnesis</summary>
          <div className="card-body">
            <form onSubmit={submitAnamnesis}>
              {anamnesisTemplate.sections?.map((section, idx) => (
                <div key={idx} className="mb-4">
                  <h5>{section.title}</h5>
                  <div className="row">
                    {section.fields?.map((field) => (
                      <div key={field.key} className="col-md-6 mb-3">
                        <label className="form-label">{field.label}</label>
                        {renderTemplateField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button className="btn btn-primary" type="submit">Guardar anamnesis</button>
            </form>
          </div>
        </details>
      )}

      {anamnesisTemplate && anamnesisList.length > 0 && (
        <div className="alert alert-info">La anamnesis base ya fue cargada.</div>
      )}

      {anamnesisList.length > 0 && (
        <details className="card" open>
          <summary className="card-header bg-light">Anamnesis</summary>
        <div className="card-body">
          {anamnesisList.map((a) => {
            const data = a.dataJson ? JSON.parse(a.dataJson) : {}
            const labelMap = {}
            anamnesisTemplate?.sections?.forEach((s) => {
              s.fields?.forEach((f) => { labelMap[f.key] = f.label })
            })
            return (
              <div key={a.id} className="d-flex justify-content-between align-items-center border rounded p-2 mb-2">
                <div>
                  <strong>Anamnesis inicial</strong> - {new Date(a.createdAt).toLocaleString()} - {a.createdByEmail}
                </div>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    setSelectedAnamnesis(a)
                    setSelectedAnamnesisData(data)
                    setEditAnamnesisMode(false)
                    setShowAnamnesisModal(true)
                  }}
                >
                  Ver
                </button>
              </div>
            )
          })}
        </div>
        </details>
      )}

      {showAnamnesisModal && selectedAnamnesis && (
        <div className="modal-backdrop" onClick={() => setShowAnamnesisModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="mb-0">Anamnesis inicial</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowAnamnesisModal(false)}>Cerrar</button>
            </div>
            <div className="modal-body">
              {anamnesisTemplate?.sections?.map((section, idx) => (
                <div key={idx} className="mb-4">
                  <h6>{section.title}</h6>
                  <div className="row">
                    {section.fields?.map((field) => (
                      <div key={field.key} className="col-md-6 mb-2">
                        <label className="form-label">{field.label}</label>
                        {renderSelectedField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              {!editAnamnesisMode && (
                <button className="btn btn-outline-primary" onClick={() => setEditAnamnesisMode(true)}>Editar</button>
              )}
              {editAnamnesisMode && (
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    setError('')
                    try {
                      await api.put(`/patients/${id}/anamneses/${selectedAnamnesis.id}`, { data: selectedAnamnesisData })
                      setEditAnamnesisMode(false)
                      setShowAnamnesisModal(false)
                      loadAll()
                    } catch (err) {
                      setError(err?.response?.data?.error || 'Error guardando anamnesis')
                    }
                  }}
                >
                  Guardar cambios
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header bg-light">Evoluciones</div>
        <div className="card-body">
          <form onSubmit={submitEvolution} className="mb-3">
            <textarea className="form-control" rows="3" value={evolutionText} onChange={(e) => setEvolutionText(e.target.value)} placeholder="Escribí la evolución..."></textarea>
            <button className="btn btn-primary mt-2" type="submit">Guardar evolución</button>
          </form>
          <ul className="list-group">
            {evolutions.map((ev) => (
              <li key={ev.id} className="list-group-item">
                <div className="text-muted small">{new Date(ev.createdAt).toLocaleString()} - {ev.createdByEmail}</div>
                <div>{ev.notes}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="card">
        <div className="card-header bg-info text-white">Registrar visita</div>
        <div className="card-body">
          <form onSubmit={submitVisit} className="row g-2">
            <div className="col-md-3">
              <input className="form-control" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
            </div>
            <div className="col-md-7">
              <input className="form-control" placeholder="Notas" value={visitNotes} onChange={(e) => setVisitNotes(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button className="btn btn-primary w-100" type="submit">Guardar</button>
            </div>
          </form>
          <ul className="list-group mt-3">
            {visits.map((v) => (
              <li key={v.id} className="list-group-item">
                {v.visitDate} - {v.notes || 'Sin notas'}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-secondary text-white">Métricas corporales</div>
        <div className="card-body">
          <form onSubmit={submitMetric} className="row g-2 mb-3">
            <div className="col-md-3">
              <input className="form-control" type="datetime-local" value={metricForm.measuredAt} onChange={(e) => setMetricForm({ ...metricForm, measuredAt: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="Peso (kg)" value={metricForm.weightKg} onChange={(e) => setMetricForm({ ...metricForm, weightKg: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="Altura (m)" value={metricForm.heightM} onChange={(e) => setMetricForm({ ...metricForm, heightM: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="IMC" value={metricForm.bmi} onChange={(e) => setMetricForm({ ...metricForm, bmi: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="Cintura (cm)" value={metricForm.waistCm} onChange={(e) => setMetricForm({ ...metricForm, waistCm: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input className="form-control" type="number" placeholder="Cuello (cm)" value={metricForm.neckCm} onChange={(e) => setMetricForm({ ...metricForm, neckCm: e.target.value })} />
            </div>
            <div className="col-md-1">
              <button className="btn btn-primary w-100" type="submit">Guardar</button>
            </div>
          </form>

          {renderLineChart('Peso (kg)', 'weightKg', 'kg')}
          {renderLineChart('Altura (m)', 'heightM', 'm')}
          {renderLineChart('IMC', 'bmi', '')}
          {renderLineChart('Cintura (cm)', 'waistCm', 'cm')}
          {renderLineChart('Cuello (cm)', 'neckCm', 'cm')}
        </div>
      </div>

      {['PRO', 'PREMIUM'].includes(settings.planType || 'BASIC') && (
        <div className="card">
          <div className="card-header bg-warning">Plan alimenticio</div>
          <div className="card-body">
            <div className="mb-2">
              <label className="form-label">Notas para la IA (opcional)</label>
              <input className="form-control" value={planNotes} onChange={(e) => setPlanNotes(e.target.value)} placeholder="Ej: foco en colesterol, preferencia vegetariana..." />
            </div>
            <textarea className="form-control" rows="8" value={planText} onChange={(e) => setPlanText(e.target.value)} placeholder="Escribí el plan alimenticio..."></textarea>
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-outline-primary" onClick={generatePlan} disabled={isGeneratingPlan}>
                {isGeneratingPlan ? 'Generando...' : 'Generar con IA'}
              </button>
              <button className="btn btn-primary" onClick={savePlan}>Guardar</button>
              <button className="btn btn-outline-secondary" onClick={openPlanPdf}>Ver PDF</button>
            </div>
          </div>
        </div>
      )}

      {showPlanPdf && (
        <div className="modal-backdrop" onClick={closePlanPdf}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ width: '90%', height: '90%' }}>
            <div className="modal-header">
              <h5 className="mb-0">Plan alimenticio (PDF)</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={closePlanPdf}>Cerrar</button>
            </div>
            <div className="modal-body" style={{ height: 'calc(100% - 60px)' }}>
              {planPdfUrl && (
                <iframe title="Plan PDF" src={planPdfUrl} style={{ width: '100%', height: '100%', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
