export type PlanStatus = 'BORRADOR_IA' | 'EN_REVISION' | 'APROBADO' | 'COMPARTIDO'
export type PlanGoal = 'MANTENIMIENTO' | 'DESCENSO' | 'AUMENTO' | 'OTRO'
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'VERY_ACTIVE'

export interface PlanMeal {
  slot: string
  text: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  groups?: Record<string, number>
}
export interface PlanDay { label: string; meals: PlanMeal[] }
export interface PlanContent { days: PlanDay[] }

export interface ValidationReport {
  passed: boolean
  avg_kcal: number
  avg_protein_g: number
  avg_carbs_g: number
  avg_fat_g: number
  target_kcal: number
  deltas: Record<string, number>
  violations: string[]
  guideline_issues: string[]
  avg_groups?: Record<string, number>
}

export interface PlanGenerationTrace {
  id: number
  provider: string
  model: string
  prompt_version: string
  input_tokens: number | null
  output_tokens: number | null
  estimated_cost_usd: string | null
  validation_passed: boolean | null
  validation_report: ValidationReport
  created_at: string
}

export interface NutritionPlan {
  id: number
  patient: number
  title: string
  status: PlanStatus
  goal: PlanGoal | ''
  target_kcal: number | null
  target_protein_g: string | null
  target_carbs_g: string | null
  target_fat_g: string | null
  hard_constraints: string[]
  content: PlanContent | Record<string, never>
  professional_notes: string
  approved_by: number | null
  approved_at: string | null
  share_token: string
  share_enabled: boolean
  visible_to_patient: boolean
  last_generation: PlanGenerationTrace | null
  created_at: string
}

export interface PatientConsent {
  id: number
  patient: number
  granted: boolean
  granted_at: string | null
  revoked_at: string | null
  method: string
  notes: string
  is_active: boolean
}
