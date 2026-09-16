import { api } from '@/lib/api'
import type { ClinicalEvolution, CreateEvolutionRequest, UpdateEvolutionRequest } from '@/types/clinicalEvolution'

export const evolutionsService = {
  list: (patientId: string) =>
    api.get<ClinicalEvolution[]>(`/patients/${patientId}/evolutions`).then(r => r.data),

  create: (patientId: string, body: CreateEvolutionRequest) =>
    api.post<ClinicalEvolution>(`/patients/${patientId}/evolutions`, body).then(r => r.data),

  update: (patientId: string, id: string, body: UpdateEvolutionRequest) =>
    api.put<ClinicalEvolution>(`/patients/${patientId}/evolutions/${id}`, body).then(r => r.data),

  delete: (patientId: string, id: string) =>
    api.delete(`/patients/${patientId}/evolutions/${id}`),
}
