export interface ClinicalEvolution {
  id: string
  patientId: string
  date: string
  weightKg: number | null
  heightCm: number | null
  bmi: number | null
  waistCm: number | null
  hipCm: number | null
  armCm: number | null
  bodyFatPercentage: number | null
  muscleMassPercentage: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  clinicalNotes: string | null
  dietaryAssessment: string | null
  nextVisitObjectives: string | null
  createdAt: string
  updatedAt: string | null
}

export type CreateEvolutionRequest = Omit<ClinicalEvolution, 'id' | 'patientId' | 'bmi' | 'createdAt' | 'updatedAt'>
export type UpdateEvolutionRequest = CreateEvolutionRequest
