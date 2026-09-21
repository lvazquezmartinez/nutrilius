import { api } from '@/lib/api'
import type { Visit, VisitStatus, CreateVisitRequest, UpdateVisitRequest } from '@/types/visit'

const statusFromApi = (s: string): VisitStatus =>
  s === 'COMPLETED' ? 'Completed' : s === 'CANCELLED' || s === 'NO_SHOW' ? 'Cancelled' : 'Scheduled'

function fromApi(d: any): Visit {
  return {
    id: String(d.id),
    patientId: String(d.patient),
    scheduledAt: d.scheduled_at,
    durationMinutes: d.duration_minutes ?? null,
    status: statusFromApi(d.status),
    reason: d.reason || null,
    notes: d.notes || null,
    cancelledAt: d.cancelled_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }
}

const toApi = (patientId: string, body: CreateVisitRequest | UpdateVisitRequest) => ({
  patient: Number(patientId),
  scheduled_at: body.scheduledAt,
  duration_minutes: body.durationMinutes,
  reason: body.reason ?? '',
  notes: body.notes ?? '',
})

export const visitsService = {
  listByPatient: (patientId: string): Promise<Visit[]> =>
    api.get<{ results: any[] }>('/visits/', { params: { patient: patientId, limit: 100 } })
      .then(r => r.data.results.map(fromApi)),

  create: (patientId: string, body: CreateVisitRequest) =>
    api.post('/visits/', toApi(patientId, body)).then(r => fromApi(r.data)),

  update: (patientId: string, id: string, body: UpdateVisitRequest) =>
    api.put(`/visits/${id}/`, toApi(patientId, body)).then(r => fromApi(r.data)),

  cancel: (_patientId: string, id: string) =>
    api.post(`/visits/${id}/cancel/`).then(r => fromApi(r.data)),

  complete: (_patientId: string, id: string, notes?: string) =>
    api.post(`/visits/${id}/complete/`, { notes }).then(r => fromApi(r.data)),
}
