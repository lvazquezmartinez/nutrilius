export interface Anamnesis {
  id: string
  patientId: string
  // 1
  occupation: string | null
  reasonForConsultation: string | null
  // 2
  medications: string | null
  alcoholConsumption: string | null
  smokingStatus: string | null
  digestiveSymptoms: string | null
  // 3
  mealsPerDay: number | null
  whoCooks: string | null
  eatingOutFrequency: string | null
  supplements: string | null
  foodAllergies: string | null
  medicalCulturalRestrictions: string | null
  foodAversions: string | null
  habitsComments: string | null
  // 4
  recall24hBreakfast: string | null
  recall24hMorningSnack: string | null
  recall24hLunch: string | null
  recall24hAfternoonSnack: string | null
  recall24hDinner: string | null
  recall24hWater: string | null
  recall24hSweets: string | null
  recall24hCookingMethods: string | null
  // 5
  physicalActivity: string | null
  // 6
  weightKg: number | null
  heightCm: number | null
  waistCm: number | null
  neckCm: number | null
  hipCm: number | null
  armCm: number | null
  // 7
  finalComments: string | null
  createdAt: string
  updatedAt: string | null
}

export type UpsertAnamnesisRequest = Omit<Anamnesis, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>
