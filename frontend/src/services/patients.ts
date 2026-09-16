import { api } from '@/lib/api'
import type {
  Patient,
  PatientPagedResult,
  CreatePatientRequest,
  UpdatePatientRequest,
} from '@/types/patient'

export const patientsService = {
  list: (params: {
    search?: string
    status?: string
    page?: number
    pageSize?: number
  }) =>
    api.get<PatientPagedResult>('/patients', { params }).then(r => r.data),

  getById: (id: string) =>
    api.get<Patient>(`/patients/${id}`).then(r => r.data),

  create: (body: CreatePatientRequest) =>
    api.post<Patient>('/patients', body).then(r => r.data),

  update: (id: string, body: UpdatePatientRequest) =>
    api.put<Patient>(`/patients/${id}`, body).then(r => r.data),

  deactivate: (id: string) =>
    api.post(`/patients/${id}/deactivate`).then(r => r.data),

  reactivate: (id: string) =>
    api.post(`/patients/${id}/reactivate`).then(r => r.data),
}
