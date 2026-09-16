export type Sex = 'Male' | 'Female' | 'Other'
export type PatientStatus = 'Active' | 'Inactive'

export interface Patient {
  id: string
  fullName: string
  dni: string | null
  sex: Sex | null
  phone: string | null
  email: string | null
  dateOfBirth: string | null
  age: number | null
  isNew: boolean
  status: PatientStatus
  deactivatedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string | null
}

export interface PatientListItem {
  id: string
  fullName: string
  dni: string | null
  phone: string | null
  email: string | null
  age: number | null
  isNew: boolean
  status: PatientStatus
  createdAt: string
}

export interface PatientPagedResult {
  items: PatientListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CreatePatientRequest {
  fullName: string
  dni?: string
  sex?: Sex
  phone?: string
  email?: string
  dateOfBirth?: string
  notes?: string
}

export interface UpdatePatientRequest {
  fullName: string
  dni?: string
  sex?: Sex
  phone?: string
  email?: string
  dateOfBirth?: string
  notes?: string
}
