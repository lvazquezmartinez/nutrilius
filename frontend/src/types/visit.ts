export type VisitStatus = 'Scheduled' | 'Completed' | 'Cancelled'

export interface Visit {
  id: string
  patientId: string
  scheduledAt: string
  durationMinutes: number | null
  status: VisitStatus
  reason: string | null
  notes: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string | null
}

export interface CreateVisitRequest {
  scheduledAt: string
  durationMinutes?: number
  reason?: string
  notes?: string
}

export interface UpdateVisitRequest {
  scheduledAt: string
  durationMinutes?: number
  reason?: string
  notes?: string
}
