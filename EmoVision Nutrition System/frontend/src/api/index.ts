import client from './client'

export async function login(email: string, password: string) {
  const { data } = await client.post('/api/v1/auth/login', { email, password })
  return data
}

export async function register(payload: { email: string; password: string; full_name?: string }) {
  const { data } = await client.post('/api/v1/auth/register', payload)
  return data
}

export async function getProfile() {
  const { data } = await client.get('/api/v1/profile')
  return data
}

export async function analyzeMeal(formData: FormData) {
  const { data } = await client.post('/api/v1/meal/analyze', formData)
  return data
}

export async function getMealHistory(limit = 20) {
  const { data } = await client.get('/api/v1/meal/history', { params: { limit } })
  return data
}

export async function getProviders() {
  const { data } = await client.get('/api/v1/admin/providers')
  return data
}

export async function getProviderTemplates() {
  const { data } = await client.get('/api/v1/admin/providers/templates')
  return data
}

export async function createProvider(payload: {
  provider_type: 'openai_compatible' | 'new_api' | 'gemini' | 'claude'
  name: string
  base_url: string
  api_key: string
  model_map: Record<string, string>
  priority?: number
  enabled?: boolean
}) {
  const { data } = await client.post('/api/v1/admin/providers', payload)
  return data
}

export async function testProvider(providerId: number) {
  const { data } = await client.post(`/api/v1/admin/providers/${providerId}/test`)
  return data
}
