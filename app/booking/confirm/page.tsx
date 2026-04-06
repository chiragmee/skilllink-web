'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { createBooking, initiatePayment, verifyPayment } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

declare global {
  interface Window { Razorpay: any }
}

function ConfirmContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const existingBookingId = params.get('bookingId') || ''
  const expertId = params.get('expertId') || ''
  const pricingId = params.get('pricingId') || ''
  const date = params.get('date') || ''
  const start = params.get('start') || ''
  const end = params.get('end') || ''
  const mode = params.get('mode') || 'online'
  const expertName = params.get('expertName') || 'Expert'
  const amount = parseInt(params.get('amount') || '0')
  const duration = parseInt(params.get('duration') || '60')

  const [step, setStep] = useState<'summary' | 'paying' | 'success' | 'error'>('summary')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user, router])

  // Validate required params
  const missingParams = !expertId || !pricingId || !date || !start || !end
  if (missingParams && !existingBookingId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
        <span className="material-symbols-outlined text-5xl text-zinc-300 mb-4">error_outline</span>
        <h2 className="text-xl font-bold mb-2">Invalid Booking Link</h2>
        <p className="text-zinc-500 text-sm mb-6">Some booking details are missing. Please go back and try again.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-primary text-white rounded-2xl font-bold">
          Go Back
        </button>
      </div>
    )
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : ''

  async function handlePay() {
    setStep('paying')
    setErrorMsg('')
    try {
      // Create booking if not already created
      let bookingId = existingBookingId
      if (!bookingId) {
        const booking = await createBooking({
          expertId, pricingId, slotDate: date, slotStart: start, slotEnd: end,
          mode: mode as 'online' | 'offline',
        })
        if (!booking?.id) throw new Error('BOOKING_FAILED')
        bookingId = booking.id
      }

      // Initiate Razorpay order
      const payData = await initiatePayment(bookingId)
      if (!payData?.razorpayOrderId) throw new Error('PAYMENT_INIT_FAILED')

      // Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('SCRIPT_FAILED'))
        document.body.appendChild(script)
      })

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || payData.razorpayKeyId,
        order_id: payData.razorpayOrderId,
        amount: payData.amount,
        currency: payData.currency,
        name: 'SkillLink',
        description: `Session with ${expertName}`,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#4F46E5' },
        handler: function(response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          // Always move to success — payment was captured by Razorpay.
          // verifyPayment confirms it on our backend; if it fails transiently,
          // the Razorpay webhook will reconcile asynchronously.
          verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          }).catch(() => {
            // Verification failed — webhook will reconcile. Still show success
            // since money was captured by Razorpay. Booking status will update shortly.
          }).finally(() => setStep('success'))
        },
        modal: {
          ondismiss: function() {
            setStep('summary')
          }
        }
      })
      rzp.on('payment.failed', function() {
        setStep('error')
        setErrorMsg('Your payment could not be processed. Please try again.')
      })
      rzp.open()
    } catch (err: any) {
      setStep('error')
      const code = err.message
      if (code === 'BOOKING_FAILED') {
        setErrorMsg('Could not create your booking. The slot may already be taken — please go back and select another.')
      } else if (code === 'PAYMENT_INIT_FAILED') {
        setErrorMsg('Payment setup failed. Please try again in a moment.')
      } else if (code === 'SCRIPT_FAILED') {
        setErrorMsg('Could not load the payment gateway. Please check your internet connection and try again.')
      } else {
        setErrorMsg(err.message || 'Something went wrong. Please try again.')
      }
    }
  }

  if (step === 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-green-600 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-on-surface-variant mb-1">Session with <strong>{expertName}</strong></p>
      <p className="text-on-surface-variant text-sm mb-2">{formattedDate}</p>
      <p className="text-on-surface-variant text-sm mb-8">{start} – {end}</p>
      <button onClick={() => router.replace('/bookings')}
        className="w-full max-w-xs bg-primary text-white font-bold px-8 py-4 rounded-2xl mb-3">
        View My Bookings
      </button>
      <button onClick={() => router.replace('/')}
        className="text-sm text-zinc-400 hover:text-zinc-600">
        Back to Home
      </button>
    </div>
  )

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopBar variant="checkout" />
      <main className="mt-16 max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold mt-6 mb-6">Confirm Booking</h1>

        {/* Session Details */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 mb-4">
          <h2 className="font-semibold text-on-surface-variant text-xs mb-4 uppercase tracking-widest">Session Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Expert</span>
              <span className="font-semibold text-sm">{expertName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Date</span>
              <span className="font-semibold text-sm">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Time</span>
              <span className="font-semibold text-sm">{start} – {end}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Duration</span>
              <span className="font-semibold text-sm">{duration} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Mode</span>
              <span className="font-semibold text-sm capitalize">{mode}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 mb-4">
          <h2 className="font-semibold text-on-surface-variant text-xs mb-4 uppercase tracking-widest">Price Breakdown</h2>
          <div className="flex justify-between mb-2">
            <span className="text-on-surface-variant text-sm">Session Fee</span>
            <span className="font-semibold text-sm">&#8377;{(amount / 100).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-on-surface-variant text-sm">Platform Fee</span>
            <span className="font-semibold text-sm text-green-600">Free</span>
          </div>
          <div className="border-t border-zinc-100 mt-3 pt-3 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-lg text-primary">&#8377;{(amount / 100).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Error */}
        {step === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex gap-3 items-start">
            <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5">error</span>
            <div>
              <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
              <button onClick={() => setStep('summary')} className="text-red-600 text-sm font-semibold mt-1 underline">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Trust badge */}
        <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-indigo-600 flex-shrink-0">shield</span>
          <p className="text-sm text-indigo-700">
            Payment is secured via Razorpay. Your money is held safely and released only after your session is confirmed.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-lg mx-auto">
          <button onClick={handlePay} disabled={step === 'paying'}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-3">
            {step === 'paying' ? (
              <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Setting up payment…</span></>
            ) : (
              <><span className="material-symbols-outlined">payments</span>Pay &#8377;{(amount / 100).toLocaleString('en-IN')}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
