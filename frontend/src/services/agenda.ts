import { api } from '@/lib/api'

export interface AgendaVisit {
  id: number
  patient: number
  patient_name: string
  scheduled_at: string
  duration_minutes: number
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  reason: string
}

export interface InactivePatient {
  id: number
  name: string
  dni: string
  last_visit: string | null
}

function results<T>(d: any): T[] {
  return (d?.results ?? d) as T[]
}

export const agendaService = {
  range: (from: string, to: string): Promise<AgendaVisit[]> =>
    api.get('/visits/', { params: { from, to } }).then(r => results<AgendaVisit>(r.data)),

  inactive: (days: number): Promise<{ count: number; patients: InactivePatient[] }> =>
    api.get('/visits/inactive-patients/', { params: { days } }).then(r => r.data),
}
