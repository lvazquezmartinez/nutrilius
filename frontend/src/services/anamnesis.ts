import { api } from '@/lib/api'
import type { Anamnesis, UpsertAnamnesisRequest } from '@/types/anamnesis'

export const anamnesisService = {
  get: (patientId: string) =>
    api.get<Anamnesis>(`/patients/${patientId}/anamnesis`).then(r => r.data).catch(e => {
      if (e.response?.status === 204) return null
      throw e
    }),

  upsert: (patientId: string, body: UpsertAnamnesisRequest) =>
    api.put<Anamnesis>(`/patients/${patientId}/anamnesis`, body).then(r => r.data),
}
