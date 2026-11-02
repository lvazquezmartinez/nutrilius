import { api } from '@/lib/api'
import type {
  NutritionPlan, PlanContent, PlanGoal, ActivityLevel, ValidationReport, PatientConsent,
} from '@/types/plan'

function results<T>(d: any): T[] {
  return (d?.results ?? d) as T[]
}

export const plansService = {
  listByPatient: (patientId: string): Promise<NutritionPlan[]> =>
    api.get('/plans/', { params: { patient: patientId } }).then(r => results<NutritionPlan>(r.data)),

  create: (patientId: string, title: string): Promise<NutritionPlan> =>
    api.post('/plans/', { patient: Number(patientId), title }).then(r => r.data),

  generate: (planId: number, goal: PlanGoal, activityLevel: ActivityLevel):
    Promise<{ plan: NutritionPlan; report: ValidationReport }> =>
    api.post(`/plans/${planId}/generate/`, { goal, activity_level: activityLevel }).then(r => r.data),

  update: (planId: number, patch: Partial<Pick<NutritionPlan, 'title' | 'professional_notes'>> & { content?: PlanContent }):
    Promise<NutritionPlan> =>
    api.patch(`/plans/${planId}/`, patch).then(r => r.data),

  submit:      (planId: number): Promise<NutritionPlan> => api.post(`/plans/${planId}/submit/`).then(r => r.data),
  approve:     (planId: number): Promise<NutritionPlan> => api.post(`/plans/${planId}/approve/`).then(r => r.data),
  share:       (planId: number): Promise<NutritionPlan> => api.post(`/plans/${planId}/share/`).then(r => r.data),
  revokeShare: (planId: number): Promise<NutritionPlan> => api.post(`/plans/${planId}/revoke-share/`).then(r => r.data),
}

export const consentService = {
  getByPatient: (patientId: string): Promise<PatientConsent | null> =>
    api.get('/consents/', { params: { patient: patientId } })
      .then(r => results<PatientConsent>(r.data).find(c => c.is_active) ?? null),

  grant: (patientId: string, method = 'verbal', notes = ''): Promise<PatientConsent> =>
    api.post('/consents/', { patient: Number(patientId), method, notes }).then(r => r.data),

  revoke: (consentId: number): Promise<PatientConsent> =>
    api.post(`/consents/${consentId}/revoke/`).then(r => r.data),
}
