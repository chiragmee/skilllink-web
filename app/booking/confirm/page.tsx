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

  const [step, setStep] = useState<'summary'|'paying'|'success'|'error'>('summary')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user, router])

  async function handlePay() {
    setStep('paying')
    setErrorMsg('')
    try {
      // Use existing booking (from bookings page) or create new one
      let bookingId = existingBookingId
      if (!bookingId) {
        const booking = await createBooking({ expertId, pricingId, slotDate: date, slotStart: start, slotEnd: end, mode: mode as 'online'|'offline' })
        bookingId = booking.id
      }

      // 2. Initiate payment
      const payData = await initiatePayment(bookingId)

      // 3. Load Razorpay script
      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) { resolve(); return }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load Razorpay'))
        document.body.appendChild(script)
      })

      // 4. Open checkout
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
          // Verify signature on backend so booking is confirmed without needing webhook
          verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          }).catch(console.error).finally(() => setStep('success'))
        },
        modal: {
          ondismiss: function() {
            setStep('summary')
          }
        }
      })
      rzp.on('payment.failed', function() {
        setStep('error')
        setErrorMsg('Payment failed. Please try again.')
      })
      rzp.open()
    } catch (err: any) {
      setStep('error')
      setErrorMsg(err.message || 'Something went wrong')
    }
  }

  if (step === 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-on-surface-variant mb-2">Session with <strong>{expertName}</strong></p>
      <p className="text-on-surface-variant text-sm mb-8">{date} at {start}</p>
      <button onClick={() => router.push('/bookings')}
        className="bg-primary text-white font-bold px-8 py-4 rounded-2xl">
        View My Bookings
      </button>
    </div>
  )

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopBar variant="checkout" />
      <main className="mt-16 max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold mt-6 mb-6">Confirm Booking</h1>

        <div className="bg-white rounded-3xl p-6 border border-zinc-100 mb-4">
          <h2 className="font-semibold text-on-surface-variant text-sm mb-4 uppercase tracking-wide">Session Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Expert</span>
              <span className="font-semibold">{expertName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Date</span>
              <span className="font-semibold">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Time</span>
              <span className="font-semibold">{start} – {end}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Duration</span>
              <span className="font-semibold">{duration} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Mode</span>
              <span className="font-semibold capitalize">{mode}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-100 mb-4">
          <h2 className="font-semibold text-on-surface-variant text-sm mb-4 uppercase tracking-wide">Price Breakdown</h2>
          <div className="flex justify-between mb-2">
            <span className="text-on-surface-variant">Session Fee</span>
            <span className="font-semibold">&#8377;{(amount/100).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-on-surface-variant">Platform Fee</span>
            <span className="font-semibold text-green-600">Free</span>
          </div>
          <div className="border-t border-zinc-100 mt-3 pt-3 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-lg text-primary">&#8377;{(amount/100).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {step === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
            <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-indigo-600 flex-shrink-0">shield</span>
          <p className="text-sm text-indigo-700">Payment is secured and processed via Razorpay. Your money is held safely until the session is completed.</p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-lg mx-auto">
          <button onClick={handlePay} disabled={step==='paying'}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-3">
            {step==='paying' ? (
              <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/><span>Processing…</span></>
            ) : (
              <>Pay &#8377;{(amount/100).toLocaleString('en-IN')} via Razorpay</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/></div>}>
      <ConfirmContent />
    </Suspense>
  )
}
