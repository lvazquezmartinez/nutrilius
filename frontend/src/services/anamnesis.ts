import { api } from '@/lib/api'
import type { Anamnesis, UpsertAnamnesisRequest } from '@/types/anamnesis'
import { applyMap, invert } from './_map'

// camelCase (front) → snake_case (API)
const MAP: Record<string, string> = {
  occupation: 'occupation',
  reasonForConsultation: 'reason_for_consultation',
  medications: 'medications',
  alcoholConsumption: 'alcohol_consumption',
  smokingStatus: 'smoking_status',
  digestiveSymptoms: 'digestive_symptoms',
  mealsPerDay: 'meals_per_day',
  whoCooks: 'who_cooks',
  eatingOutFrequency: 'eating_out_frequency',
  supplements: 'supplements',
  foodAllergies: 'food_allergies',
  medicalCulturalRestrictions: 'medical_cultural_restrictions',
  foodAversions: 'food_aversions',
  habitsComments: 'habits_comments',
  recall24hBreakfast: 'recall_24h_breakfast',
  recall24hMorningSnack: 'recall_24h_morning_snack',
  recall24hLunch: 'recall_24h_lunch',
  recall24hAfternoonSnack: 'recall_24h_afternoon_snack',
  recall24hDinner: 'recall_24h_dinner',
  recall24hWater: 'recall_24h_water',
  recall24hSweets: 'recall_24h_sweets',
  recall24hCookingMethods: 'recall_24h_cooking_methods',
  physicalActivity: 'physical_activity',
  weightKg: 'weight_kg',
  heightCm: 'height_cm',
  waistCm: 'waist_cm',
  neckCm: 'neck_cm',
  hipCm: 'hip_cm',
  armCm: 'arm_cm',
  finalComments: 'final_comments',
}
const INV = invert(MAP)

function fromApi(d: any): Anamnesis {
  return {
    id: String(d.id),
    patientId: String(d.patient),
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    ...(applyMap(d, INV) as any),
  }
}

export const anamnesisService = {
  get: async (patientId: string): Promise<Anamnesis | null> => {
    const { data } = await api.get<{ results: any[] }>('/anamneses/', { params: { patient: patientId } })
    return data.results.length ? fromApi(data.results[0]) : null
  },

  upsert: async (patientId: string, body: UpsertAnamnesisRequest): Promise<Anamnesis> => {
    const payload = { patient: Number(patientId), ...applyMap(body as any, MAP) }
    const existing = await api.get<{ results: any[] }>('/anamneses/', { params: { patient: patientId } })
    if (existing.data.results.length) {
      const id = existing.data.results[0].id
      const { data } = await api.put(`/anamneses/${id}/`, payload)
      return fromApi(data)
    }
    const { data } = await api.post('/anamneses/', payload)
    return fromApi(data)
  },
}
