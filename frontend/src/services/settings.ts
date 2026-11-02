import { api } from '@/lib/api'

export interface TenantSettings {
  nutritionist_name: string
  business_name: string
  license_number: string
  logo_url: string
  slug: string | null
  plan_type: string
}

export const settingsService = {
  get: (): Promise<TenantSettings> => api.get('/settings').then(r => r.data),
  update: (patch: Partial<TenantSettings>): Promise<TenantSettings> =>
    api.put('/settings', patch).then(r => r.data),
}
