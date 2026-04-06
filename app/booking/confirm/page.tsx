'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TopBar from '@/components/TopBar'
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
  const mode = params.get('mode') ?? 'online'
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

        if (!booking?.id) {
          throw new Error('BOOKING_FAILED')
        }

        bookingId = booking.id
      }

      const payment = await initiatePayment(bookingId)
      if (!payment?.razorpayOrderId) {
        throw new Error('PAYMENT_INIT_FAILED')
      }

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
      setStep('error')
      setErrorMessage(USER_FRIENDLY_ERRORS[code] || 'Something went wrong while processing payment. Please try again.')
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
          <button
            onClick={() => router.back()}
            className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Date from your existing booking'

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar variant="checkout" title="Confirm Booking" backHref="/" />

      <main className="app-shell px-4 pb-24 pt-5 sm:px-6">
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Session Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Expert</span>
              <span className="font-semibold text-slate-900">{expertName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-900">{formattedDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Time</span>
              <span className="font-semibold text-slate-900">
                {start && end ? `${start} - ${end}` : 'From existing booking'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-900">{duration} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mode</span>
              <span className="font-semibold capitalize text-slate-900">{mode}</span>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl bg-white p-5 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Price Breakdown</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Session Fee</span>
              <span className="font-semibold text-slate-900">Rs {(amount / 100).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Platform Fee</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="text-xl font-semibold text-slate-900">Rs {(amount / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </section>

        {step === 'error' && (
          <section className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4">
        <div className="app-shell">
          <button
            onClick={handlePayment}
            disabled={step === 'paying'}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {step === 'paying' ? 'Preparing payment...' : `Pay Rs ${(amount / 100).toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
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
