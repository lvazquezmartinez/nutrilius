import { api } from '@/lib/api'
import type { ClinicalEvolution, CreateEvolutionRequest, UpdateEvolutionRequest } from '@/types/clinicalEvolution'
import { applyMap, invert } from './_map'

const MAP: Record<string, string> = {
  date: 'date',
  weightKg: 'weight_kg',
  heightCm: 'height_cm',
  bmi: 'bmi',
  waistCm: 'waist_cm',
  hipCm: 'hip_cm',
  armCm: 'arm_cm',
  bodyFatPercentage: 'body_fat_pct',
  muscleMassPercentage: 'muscle_mass_pct',
  bloodPressureSystolic: 'blood_pressure_systolic',
  bloodPressureDiastolic: 'blood_pressure_diastolic',
  clinicalNotes: 'clinical_notes',
  dietaryAssessment: 'dietary_assessment',
  nextVisitObjectives: 'next_visit_objectives',
}
const INV = invert(MAP)

function fromApi(d: any): ClinicalEvolution {
  return {
    id: String(d.id),
    patientId: String(d.patient),
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    ...(applyMap(d, INV) as any),
  }
}

const toApi = (patientId: string, body: any) => ({ patient: Number(patientId), ...applyMap(body, MAP) })

export const evolutionsService = {
  list: (patientId: string): Promise<ClinicalEvolution[]> =>
    api.get<{ results: any[] }>('/evolutions/', { params: { patient: patientId, limit: 100 } })
      .then(r => r.data.results.map(fromApi)),

  create: (patientId: string, body: CreateEvolutionRequest) =>
    api.post('/evolutions/', toApi(patientId, body)).then(r => fromApi(r.data)),

  update: (patientId: string, id: string, body: UpdateEvolutionRequest) =>
    api.put(`/evolutions/${id}/`, toApi(patientId, body)).then(r => fromApi(r.data)),

  delete: (_patientId: string, id: string) =>
    api.delete(`/evolutions/${id}/`),
}
