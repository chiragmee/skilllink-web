const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('skilllink_token')
}

type ApiEnvelope<T> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

type SearchExpertsResponse = {
  success: boolean
  experts: Expert[]
  total: number
  page: number
  message?: string
  error?: string
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean
}

function buildHeaders(headers?: HeadersInit, skipAuth?: boolean) {
  const merged = new Headers(headers)

  if (!merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json')
  }

  if (!skipAuth) {
    const token = getAuthToken()
    if (token) {
      merged.set('Authorization', `Bearer ${token}`)
    }
  }

  return merged
}

function getErrorMessage(payload: { message?: string; error?: string } | null, fallback: string) {
  return payload?.message || payload?.error || fallback
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options
  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers: buildHeaders(fetchOptions.headers, skipAuth),
  })

  if (response.status === 204) {
    return undefined as T
  }

  let payload: ApiEnvelope<T> | Record<string, unknown> | null = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload as ApiEnvelope<T> | null, 'Something went wrong. Please try again.'))
  }

  const envelope = payload as ApiEnvelope<T>

  if (typeof envelope.success === 'boolean') {
    if (!envelope.success) {
      throw new Error(getErrorMessage(envelope, 'Something went wrong. Please try again.'))
    }

    // Most endpoints return { success, data }, but auth endpoints return
    // { success, accessToken, user, ... } at the top level.
    if ('data' in envelope) {
      return envelope.data as T
    }

    const topLevel = payload as Record<string, unknown>
    const { success: _success, message: _message, error: _error, ...rest } = topLevel
    return rest as T
  }

  return payload as T
}

async function requestSearchExperts(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  const response = await fetch(`${BASE_URL}/api/v1/skills/search?${query}`, {
    method: 'GET',
    headers: buildHeaders(undefined, true),
  })

  const payload = (await response.json()) as SearchExpertsResponse

  if (!response.ok || !payload.success) {
    throw new Error(getErrorMessage(payload, 'Unable to load experts right now.'))
  }

  return {
    experts: payload.experts ?? [],
    total: payload.total ?? 0,
    page: payload.page ?? 1,
  }
}

export const api = {
  get: <T>(path: string, options?: ApiOptions) => request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: unknown, options?: ApiOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  patch: <T>(path: string, body?: unknown, options?: ApiOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}), ...options }),
}

export interface User {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
  role: 'learner' | 'expert' | 'both'
  expertProfileId: string | null
}

export interface Expert {
  id: string
  userId: string
  bio: string | null
  city: string | null
  mode: 'online' | 'offline' | 'both'
  avgRating: number
  totalReviews: number
  isActive: boolean
  user: {
    id: string
    name: string | null
    avatarUrl: string | null
    phone?: string | null
  }
  expertSkills: Array<{
    id: string
    skillId: string
    experienceYrs: number
    proficiency: string
    skill: {
      id: string
      name: string
      category: {
        name: string
      }
    }
  }>
  pricing: Array<{
    id: string
    skillId: string
    type: string
    amount: number
    sessions: number | null
    durationMins: number
    skill: {
      id: string
      name: string
    }
  }>
}

export interface SkillCategory {
  id: string
  name: string
  slug: string
  skills: Array<{
    id: string
    name: string
    slug: string
  }>
}

export interface AvailabilitySlot {
  id?: string
  expertId?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive?: boolean
}

export interface Booking {
  id: string
  learnerId: string
  expertId: string
  pricingId: string
  slotDate: string
  slotStart: string
  slotEnd: string
  mode: string
  status: string
  cancelReason: string | null
  createdAt: string
  expert?: {
    id: string
    user: {
      name: string | null
      avatarUrl: string | null
    }
  }
  learner?: {
    name: string | null
    avatarUrl: string | null
    phone?: string | null
  }
  pricing?: {
    type: string
    amount: number
    durationMins: number
  }
  payment?: {
    status: string
    amount: number
  } | null
}

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  reviewer: {
    name: string | null
    avatarUrl: string | null
  }
}

export interface AuthExchangeResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface PaymentInitiation {
  razorpayOrderId: string
  razorpayKeyId: string
  amount: number
  currency: string
}

export const authenticateWithGoogle = (supabaseToken: string) =>
  api.post<AuthExchangeResponse>('/api/v1/auth/google', { supabaseToken }, { skipAuth: true })

export const getMe = () =>
  api.get<User & { expertProfile?: { id: string } | null }>('/api/v1/me')

export const getCategories = () =>
  api.get<SkillCategory[]>('/api/v1/skills/categories', { skipAuth: true })

export const searchExperts = (params: Record<string, string>) => requestSearchExperts(params)

export const getExpert = (id: string) =>
  api.get<Expert>(`/api/v1/experts/${id}`, { skipAuth: true })

export const createExpertProfile = (data: { bio?: string; city?: string; mode?: string }) =>
  api.post<Expert>('/api/v1/experts', data)

export const addExpertSkill = (
  expertId: string,
  data: { skillId: string; experienceYrs?: number; proficiency?: string },
) => api.post(`/api/v1/experts/${expertId}/skills`, data)

export const addExpertPricing = (
  expertId: string,
  data: { skillId: string; type: string; amount: number; sessions?: number; durationMins?: number },
) => api.post(`/api/v1/experts/${expertId}/pricing`, data)

export const setAvailability = (
  expertId: string,
  data: AvailabilitySlot[] | { slots: AvailabilitySlot[] },
) => {
  const payload = Array.isArray(data) ? { slots: data } : data
  return api.post(`/api/v1/experts/${expertId}/availability`, payload)
}

export const getAvailableSlots = (expertId: string, date: string) =>
  api.get<AvailabilitySlot[]>(`/api/v1/experts/${expertId}/availability?date=${date}`, { skipAuth: true })

export const createBooking = (data: {
  expertId: string
  pricingId: string
  slotDate: string
  slotStart: string
  slotEnd: string
  mode: string
}) => api.post<Booking>('/api/v1/bookings', data)

export const listBookings = (role: 'learner' | 'expert') =>
  api.get<Booking[]>(`/api/v1/bookings?role=${role}`)

export const acceptBooking = (id: string) =>
  api.patch(`/api/v1/bookings/${id}/accept`)

export const rejectBooking = (id: string) =>
  api.patch(`/api/v1/bookings/${id}/reject`)

export const cancelBooking = (id: string, reason?: string) =>
  api.patch(`/api/v1/bookings/${id}/cancel`, { reason })

export const completeBooking = (id: string) =>
  api.patch(`/api/v1/bookings/${id}/complete`)

export const initiatePayment = (bookingId: string) =>
  api.post<PaymentInitiation>('/api/v1/payments/initiate', { bookingId })

export const verifyPayment = (data: {
  razorpayPaymentId: string
  razorpayOrderId: string
  razorpaySignature: string
}) => api.post<{ bookingId?: string }>('/api/v1/payments/verify', data)

export const paymentsWebhook = (payload: Record<string, unknown>) =>
  api.post('/api/v1/payments/webhook', payload, { skipAuth: true })

export const submitReview = (data: { bookingId: string; rating: number; comment?: string }) =>
  api.post('/api/v1/reviews', data)

export const getExpertReviews = (expertId: string) =>
  api.get<Review[]>(`/api/v1/reviews/experts/${expertId}`, { skipAuth: true })

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/health`)
    return response.ok
  } catch {
    return false
  }
}
