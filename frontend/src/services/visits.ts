import { api } from '@/lib/api'
import type { Visit, CreateVisitRequest, UpdateVisitRequest } from '@/types/visit'

export const visitsService = {
  listByPatient: (patientId: string) =>
    api.get<Visit[]>(`/patients/${patientId}/visits`).then(r => r.data),

  create: (patientId: string, body: CreateVisitRequest) =>
    api.post<Visit>(`/patients/${patientId}/visits`, body).then(r => r.data),

  update: (patientId: string, id: string, body: UpdateVisitRequest) =>
    api.put<Visit>(`/patients/${patientId}/visits/${id}`, body).then(r => r.data),

  cancel: (patientId: string, id: string) =>
    api.post(`/patients/${patientId}/visits/${id}/cancel`).then(r => r.data),

  complete: (patientId: string, id: string, notes?: string) =>
    api.post<Visit>(`/patients/${patientId}/visits/${id}/complete`, { notes }).then(r => r.data),
}
