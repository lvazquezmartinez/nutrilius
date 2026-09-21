import { api } from '@/lib/api'
import type {
  Patient,
  PatientListItem,
  PatientPagedResult,
  CreatePatientRequest,
  UpdatePatientRequest,
  Sex,
} from '@/types/patient'

// ─── Adaptadores entre la API nueva (Django) y los tipos del front ──────────
type ApiPatient = {
  id: number
  first_name: string
  last_name: string
  full_name: string
  dni: string
  birth_date: string | null
  sex: 'F' | 'M' | 'X' | ''
  phone: string
  email: string
  address: string
  notes: string
  is_new: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

type DrfPage<T> = { count: number; next: string | null; previous: string | null; results: T[] }

const sexFromApi = (s: string): Sex | null =>
  s === 'F' ? 'Female' : s === 'M' ? 'Male' : s === 'X' ? 'Other' : null
const sexToApi = (s?: Sex): string =>
  s === 'Female' ? 'F' : s === 'Male' ? 'M' : s === 'Other' ? 'X' : ''

function ageFrom(birth: string | null): number | null {
  if (!birth) return null
  const b = new Date(birth)
  if (isNaN(b.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}

function toPatient(d: ApiPatient): Patient {
  return {
    id: String(d.id),
    fullName: d.full_name || `${d.first_name} ${d.last_name}`.trim(),
    dni: d.dni || null,
    sex: sexFromApi(d.sex),
    phone: d.phone || null,
    email: d.email || null,
    dateOfBirth: d.birth_date,
    age: ageFrom(d.birth_date),
    isNew: d.is_new,
    status: d.is_active ? 'Active' : 'Inactive',
    deactivatedAt: null,
    notes: d.notes || null,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }
}

function toListItem(d: ApiPatient): PatientListItem {
  return {
    id: String(d.id),
    fullName: d.full_name || `${d.first_name} ${d.last_name}`.trim(),
    dni: d.dni || null,
    phone: d.phone || null,
    email: d.email || null,
    age: ageFrom(d.birth_date),
    isNew: d.is_new,
    status: d.is_active ? 'Active' : 'Inactive',
    createdAt: d.created_at,
  }
}

function splitName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/)
  return { first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') }
}

function toApiBody(body: CreatePatientRequest | UpdatePatientRequest) {
  return {
    ...splitName(body.fullName),
    dni: body.dni ?? '',
    sex: sexToApi(body.sex),
    phone: body.phone ?? '',
    email: body.email ?? '',
    birth_date: body.dateOfBirth || null,
    notes: body.notes ?? '',
  }
}

export const patientsService = {
  list: async (params: { search?: string; status?: string; page?: number; pageSize?: number }): Promise<PatientPagedResult> => {
    const pageSize = params.pageSize ?? 20
    const page = params.page ?? 1
    const query: Record<string, unknown> = { limit: pageSize, offset: (page - 1) * pageSize }
    if (params.search) query.search = params.search
    if (params.status === 'Active') query.is_active = true
    if (params.status === 'Inactive') query.is_active = false

    const { data } = await api.get<DrfPage<ApiPatient>>('/patients/', { params: query })
    return {
      items: data.results.map(toListItem),
      totalCount: data.count,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(data.count / pageSize)),
      hasNextPage: !!data.next,
      hasPreviousPage: !!data.previous,
    }
  },

  getById: (id: string) =>
    api.get<ApiPatient>(`/patients/${id}/`).then(r => toPatient(r.data)),

  create: (body: CreatePatientRequest) =>
    api.post<ApiPatient>('/patients/', toApiBody(body)).then(r => toPatient(r.data)),

  update: (id: string, body: UpdatePatientRequest) =>
    api.put<ApiPatient>(`/patients/${id}/`, toApiBody(body)).then(r => toPatient(r.data)),

  deactivate: (id: string) =>
    api.delete(`/patients/${id}/`).then(r => r.data),

  reactivate: (id: string) =>
    api.post(`/patients/${id}/reactivate/`).then(r => r.data),
}
