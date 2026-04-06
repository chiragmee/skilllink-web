const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('skilllink_token')
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }
  if (!skipAuth) {
    const token = getAuthToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${BASE_URL}${path}`
  const attempt = async (retrying = false): Promise<T> => {
    let res: Response
    try {
      res = await fetch(url, { ...fetchOptions, headers })
    } catch (networkErr) {
      throw new Error(`Network error: ${(networkErr as Error).message}`)
    }
    if (res.status === 503 && !retrying) {
      await new Promise((r) => setTimeout(r, 5000))
      return attempt(true)
    }
    if (!res.ok) {
      let message = `HTTP ${res.status}`
      try {
        const body = await res.json()
        message = body.message || body.error || message
      } catch {}
      throw new Error(message)
    }
    if (res.status === 204) return undefined as T
    const json = await res.json()
    // Unwrap { success, data } envelope used by all backend endpoints
    return ('data' in json ? json.data : json) as T
  }
  return attempt()
}

export const api = {
  get: <T>(path: string, opts?: ApiOptions) => request<T>(path, { method: 'GET', ...opts }),
  post: <T>(path: string, body: unknown, opts?: ApiOptions) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  patch: <T>(path: string, body: unknown, opts?: ApiOptions) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: <T>(path: string, opts?: ApiOptions) => request<T>(path, { method: 'DELETE', ...opts }),
}

// ─── Typed API methods ────────────────────────────────────────────────────────

export interface Expert {
  id: string
  userId: string
  bio: string | null
  city: string | null
  mode: string
  avgRating: number
  totalReviews: number
  isActive: boolean
  user: { id: string; name: string | null; avatarUrl: string | null; phone?: string | null }
  expertSkills: Array<{
    id: string
    skillId: string
    experienceYrs: number
    proficiency: string
    skill: { id: string; name: string; category: { name: string } }
  }>
  pricing: Array<{
    id: string
    skillId: string
    type: string
    amount: number
    sessions: number | null
    durationMins: number
    skill: { id: string; name: string }
  }>
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
    user: { name: string | null; avatarUrl: string | null }
  }
  learner?: { name: string | null; avatarUrl: string | null; phone?: string | null }
  pricing?: { type: string; amount: number; durationMins: number }
  payment?: { status: string; amount: number } | null
}

export interface AvailabilitySlot {
  id: string
  expertId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface SkillCategory {
  id: string
  name: string
  slug: string
  skills: Array<{ id: string; name: string; slug: string }>
}

// Discovery
export const searchExperts = (params: Record<string, string>) => {
  const qs = new URLSearchParams(params).toString()
  return api.get<{ experts: Expert[]; total: number; page: number }>(`/api/v1/skills/search?${qs}`, { skipAuth: true })
}

export const getCategories = () =>
  api.get<SkillCategory[]>('/api/v1/skills/categories', { skipAuth: true })

// Experts
export const getExpert = (id: string) =>
  api.get<Expert>(`/api/v1/experts/${id}`, { skipAuth: true })

export const getAvailableSlots = (expertId: string, date: string) =>
  api.get<AvailabilitySlot[]>(`/api/v1/experts/${expertId}/availability?date=${date}`, { skipAuth: true })

export const createExpertProfile = (data: { bio?: string; city?: string; mode?: string }) =>
  api.post<Expert>('/api/v1/experts', data)

export const addExpertSkill = (expertId: string, data: { skillId: string; experienceYrs?: number; proficiency?: string }) =>
  api.post(`/api/v1/experts/${expertId}/skills`, data)

export const addExpertPricing = (expertId: string, data: { skillId: string; type: string; amount: number; sessions?: number; durationMins?: number }) =>
  api.post(`/api/v1/experts/${expertId}/pricing`, data)

export const setAvailability = (expertId: string, slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) =>
  api.post(`/api/v1/experts/${expertId}/availability`, { slots })

// Bookings
export const createBooking = (data: { expertId: string; pricingId: string; slotDate: string; slotStart: string; slotEnd: string; mode: string }) =>
  api.post<Booking>('/api/v1/bookings', data)

export const listBookings = (role: 'learner' | 'expert') =>
  api.get<Booking[]>(`/api/v1/bookings?role=${role}`)

export const cancelBooking = (id: string, reason?: string) =>
  api.patch(`/api/v1/bookings/${id}/cancel`, { reason })

export const completeBooking = (id: string) =>
  api.patch(`/api/v1/bookings/${id}/complete`, {})

export const acceptBooking = (id: string) =>
  api.patch(`/api/v1/bookings/${id}/accept`, {})

// Payments
export const initiatePayment = (bookingId: string) =>
  api.post<{ payment: { id: string }; razorpayOrderId: string; razorpayKeyId: string; amount: number; currency: string }>(
    '/api/v1/payments/initiate',
    { bookingId },
  )

export const verifyPayment = (data: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) =>
  api.post<{ bookingId: string }>('/api/v1/payments/verify', data)

// User
export const getMe = () =>
  api.get<{ id: string; name: string | null; email: string | null; avatarUrl: string | null; role: string; expertProfile?: { id: string } | null }>('/api/v1/me')

export const updateMe = (data: { name?: string; avatarUrl?: string }) =>
  api.patch('/api/v1/me', data)

// Reviews
export const submitReview = (data: { bookingId: string; rating: number; comment?: string }) =>
  api.post('/api/v1/reviews', data)

export const getExpertReviews = (expertId: string) =>
  api.get<Array<{ id: string; rating: number; comment: string | null; createdAt: string; reviewer: { name: string | null; avatarUrl: string | null } }>>(
    `/api/v1/reviews/${expertId}`,
    { skipAuth: true },
  )

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    const res = await fetch(`${BASE_URL}/api/health`, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}
