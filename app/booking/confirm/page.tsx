'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBooking, initiatePayment, verifyPayment } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      on: (event: string, callback: () => void) => void
      open: () => void
    }
  }
}

const USER_FRIENDLY_ERRORS: Record<string, string> = {
  BOOKING_FAILED: 'We could not create your booking. The selected slot may no longer be available.',
  PAYMENT_INIT_FAILED: 'We could not start payment right now. Please try again in a few moments.',
  SCRIPT_FAILED: 'Payment gateway could not load. Please check your internet and try again.',
  EXPERT_ACCEPTANCE_PENDING: 'Your request was sent to the expert. Complete payment once the expert accepts it in My Bookings.',
}

function ConfirmBookingContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useAuth()

  const bookingIdFromParams = params.get('bookingId') ?? ''
  const expertId = params.get('expertId') ?? ''
  const pricingId = params.get('pricingId') ?? ''
  const date = params.get('date') ?? ''
  const start = params.get('start') ?? ''
  const end = params.get('end') ?? ''
  const rawMode = params.get('mode') ?? 'online'
  const mode = rawMode === 'both' ? 'online' : rawMode
  const expertName = params.get('expertName') ?? 'Expert'
  const amount = Number(params.get('amount') ?? '0')
  const duration = Number(params.get('duration') ?? '60')

  const [step, setStep] = useState<'summary' | 'paying' | 'error'>('summary')
  const [errorMessage, setErrorMessage] = useState('')

  const missingParamsForNewBooking = !expertId || !pricingId || !date || !start || !end
  const canProceed = bookingIdFromParams || !missingParamsForNewBooking

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [router, user])

  async function loadRazorpayScript() {
    await new Promise<void>((resolve, reject) => {
      if (window.Razorpay) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('SCRIPT_FAILED'))
      document.body.appendChild(script)
    })
  }

  async function handlePayment() {
    setStep('paying')
    setErrorMessage('')
    try {
      let bookingId = bookingIdFromParams
      if (!bookingId) {
        const booking = await createBooking({
          expertId,
          pricingId,
          slotDate: date,
          slotStart: start,
          slotEnd: end,
          mode,
        })
        if (!booking?.id) throw new Error('BOOKING_FAILED')
        if (booking.status === 'requested') {
          throw new Error('EXPERT_ACCEPTANCE_PENDING')
        }
        bookingId = booking.id
      }

      const payment = await initiatePayment(bookingId)
      if (!payment?.razorpayOrderId) throw new Error('PAYMENT_INIT_FAILED')

      await loadRazorpayScript()

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || payment.razorpayKeyId,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: 'SkillLink',
        description: `Session with ${expertName}`,
        theme: { color: '#4F46E5' },
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
        },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          try {
            await verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            })
            router.replace('/bookings')
          } catch {
            setStep('error')
            setErrorMessage('Payment completed but verification failed. Please check bookings in a moment.')
          }
        },
        modal: {
          ondismiss: () => setStep('summary'),
        },
      })

      razorpay.on('payment.failed', () => {
        setStep('error')
        setErrorMessage('Payment did not complete. You can try again safely.')
      })

      razorpay.open()
    } catch (error) {
      const code = error instanceof Error ? error.message : 'UNKNOWN'
      if (code === 'EXPERT_ACCEPTANCE_PENDING') {
        router.replace('/bookings')
        return
      }
      setStep('error')
      setErrorMessage(USER_FRIENDLY_ERRORS[code] || code || 'Something went wrong while processing payment. Please try again.')
    }
  }

  if (!canProceed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <h1 className="text-lg font-semibold text-slate-900">Booking details missing</h1>
          <p className="mt-2 text-sm text-slate-500">
            Please go back to the expert profile, select pricing and slot, then continue.
          </p>
          <button onClick={() => router.back()} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : 'Date from your existing booking'

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">SkillLink</span>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <span className="hidden text-sm text-slate-600 sm:block">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-primary">
            <span className="material-symbols-outlined text-base">lock</span>Safe & Secure
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6">
        <div className="mb-10 flex items-center justify-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">1</span>
            <span className="font-semibold">Summary</span>
          </div>
          <span className="h-px w-10 bg-slate-300" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold">2</span>
            <span className="font-semibold">Payment</span>
          </div>
          <span className="h-px w-10 bg-slate-300" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold">3</span>
            <span className="font-semibold">Done</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-3">
            <section>
              <h1 className="text-4xl font-extrabold tracking-tight">Review Booking</h1>
              <div className="mt-5 rounded-xl bg-white p-6 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200">
                    <span className="material-symbols-outlined text-slate-500">person</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{expertName}</p>
                    <p className="text-sm text-slate-500">Session confirmation</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Confirmed Date</p>
                    <p className="mt-2 text-sm font-semibold">{formattedDate}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Confirmed Time</p>
                    <p className="mt-2 text-sm font-semibold">{start && end ? `${start} - ${end}` : 'From existing booking'}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-extrabold tracking-tight">Payment Method</h2>
              <div className="mt-4 rounded-xl border-2 border-primary bg-white p-4 shadow-card">
                <p className="text-sm font-semibold">Card ending in 4242</p>
                <p className="text-xs text-slate-500">Expires 12/26</p>
              </div>
              <button className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600">
                Add New Payment Method
              </button>
            </section>
          </div>

          <aside className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-[0_20px_40px_rgba(25,28,29,0.06)]">
              <h3 className="text-2xl font-bold">Price Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Standard Session ({duration}m)</span>
                  <span className="font-medium">Rs {(amount / 100).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Service Fee</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SkillLink Protection</span>
                  <span className="font-medium">Free</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs {(amount / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={step === 'paying'}
                className="mt-5 w-full rounded-xl bg-gradient-to-br from-primary to-indigo-500 px-4 py-4 text-base font-semibold text-white disabled:opacity-60"
              >
                {step === 'paying' ? 'Preparing payment...' : 'Pay and Confirm Booking'}
              </button>

              <p className="mt-4 text-center text-xs text-slate-500">
                By confirming your booking, you agree to our <span className="text-primary underline">Cancellation Policy</span>.
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-xs text-indigo-700">
              <strong>Money-Back Guarantee:</strong> If the session does not happen as scheduled, SkillLink guarantees a full refund.
            </div>
          </aside>
        </div>

        {step === 'error' && (
          <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          </section>
        )}
      </main>
    </div>
  )
}

export default function ConfirmBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>
      }
    >
      <ConfirmBookingContent />
    </Suspense>
  )
}
