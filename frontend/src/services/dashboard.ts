import { api } from '@/lib/api'

export interface DashboardVisit {
  id: number
  scheduled_at: string
  patient_name: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  is_new: boolean
}

export interface DashboardNewPatient {
  id: number
  name: string
  dni: string
  created_at: string
}

export interface DashboardData {
  patients_active: number
  patients_new_count: number
  visits_today: DashboardVisit[]
  new_patients: DashboardNewPatient[]
}

export const dashboardService = {
  get: () => api.get<DashboardData>('/dashboard').then(r => r.data),
}
