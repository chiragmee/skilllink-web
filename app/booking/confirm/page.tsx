import Image from 'next/image'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

export default function ConfirmBookingPage() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <TopBar variant="checkout" backHref="/expert/rajesh-m" />

      <main className="max-w-2xl mx-auto pt-24 pb-36 px-6">

        {/* Booking Summary */}
        <section className="relative mb-10">
          <div className="bg-surface-container-lowest shadow-editorial rounded-[32px] p-8 overflow-hidden">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-8 -mt-8" />

            <div className="relative z-10">
              <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-4 block font-label">
                BOOKING SUMMARY
              </span>

              <div className="flex items-center gap-6 mb-8">
                <div className="relative flex-shrink-0">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOzasMZQpgwoKzBZZIjDZZP9yWgUGGgvCMBT-Db819V5j0aA2qnt_beWKO86XOM_zHGvFDCeAMaeuJfuvBux2Bt6MXoqHtVJapl9qg-mdPtFpkhpkr3AmczeC48OJdPPgQfS_xxFEFfYemwB7j-lPkSrBCyFsukfQi_ywn480pgDppQTzcgKTygn3wXINwzqgC2rnr2E5bY3WDotHU_X597VWlnf8OgnJslQqchOfMiMcEUtfINhZpdR8ZVlUhech-YtxA1fdkrxg"
                    alt="Rajesh Kumar"
                    width={80}
                    height={80}
                    className="rounded-2xl object-cover border-4 border-white shadow-sm"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                    <span className="material-symbols-outlined text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    EXPERT
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-on-surface tracking-tight leading-tight font-headline">
                    Rajesh Kumar
                  </h1>
                  <p className="text-zinc-500 font-medium">Badminton Coaching • Advanced</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span className="text-[11px] font-bold tracking-wider uppercase font-label">Date</span>
                  </div>
                  <p className="font-bold text-on-surface font-headline">Sat, 21 Oct</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-indigo-700 mb-1">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-[11px] font-bold tracking-wider uppercase font-label">Time</span>
                  </div>
                  <p className="font-bold text-on-surface font-headline">07:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Breakdown */}
        <section className="mb-10 bg-surface-container-low rounded-[32px] p-8 border border-white/50">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-6 font-label">
            PRICING BREAKDOWN
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 font-medium">Session Fee (1 hr)</span>
              <span className="font-semibold font-headline">₹500.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 font-medium">Platform Service Fee</span>
              <span className="font-semibold font-headline">₹50.00</span>
            </div>
            <div className="pt-4 mt-4 border-t border-zinc-200/50 flex justify-between items-center">
              <span className="text-lg font-bold font-headline">Total Amount</span>
              <span className="text-2xl font-extrabold text-indigo-700 font-headline">₹550.00</span>
            </div>
          </div>
        </section>

        {/* UPI Payment Methods */}
        <section className="mb-10">
          <h2 className="text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-6 px-2 font-label">
            PAY VIA UPI
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* PhonePe */}
            <button className="flex flex-col items-center gap-3 p-4 bg-surface-container-lowest shadow-editorial rounded-2xl transition-all hover:-translate-y-1 active:scale-95 border-2 border-transparent hover:border-indigo-100">
              <div className="w-12 h-12 flex items-center justify-center bg-[#5f259f] rounded-xl text-white">
                <span className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              </div>
              <span className="text-xs font-bold text-zinc-700">PhonePe</span>
            </button>

            {/* Google Pay — Selected */}
            <button className="relative flex flex-col items-center gap-3 p-4 bg-surface-container-lowest border-2 border-indigo-600 rounded-2xl transition-all hover:-translate-y-1 active:scale-95 shadow-lg shadow-indigo-100">
              <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl overflow-hidden">
                <span className="text-lg font-black text-blue-600">G</span>
                <span className="text-lg font-black text-red-500">P</span>
              </div>
              <span className="text-xs font-bold text-indigo-700">Google Pay</span>
              <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full">
                <span className="material-symbols-outlined text-[12px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            </button>

            {/* Paytm */}
            <button className="flex flex-col items-center gap-3 p-4 bg-surface-container-lowest shadow-editorial rounded-2xl transition-all hover:-translate-y-1 active:scale-95 border-2 border-transparent hover:border-indigo-100">
              <div className="w-12 h-12 flex items-center justify-center bg-[#00baf2] rounded-xl text-white">
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
              <span className="text-xs font-bold text-zinc-700">Paytm</span>
            </button>
          </div>

          {/* Manual UPI Input */}
          <div className="relative">
            <input
              className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              placeholder="Enter UPI ID (e.g., username@bank)"
              type="text"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-600 font-bold text-sm">
              Verify
            </button>
          </div>
        </section>

        {/* Trust Signal — Escrow */}
        <div className="flex items-start gap-4 p-5 bg-tertiary-fixed/10 rounded-2xl mb-12">
          <div className="bg-tertiary-container p-2 rounded-xl text-on-tertiary-container flex-shrink-0">
            <span className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">Escrow Protection Enabled</h4>
            <p className="text-xs text-zinc-600 leading-relaxed mt-1">
              Payment held in escrow until session completion. Your money is only released once the expert
              completes the session.
            </p>
          </div>
        </div>

      </main>

      {/* Sticky Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl z-50 shadow-[0_-10px_30px_rgba(25,28,29,0.04)]">
        <div className="max-w-2xl mx-auto">
          <button className="w-full h-16 bg-gradient-to-r from-secondary to-secondary-container text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-transform flex items-center justify-center gap-3 font-headline">
            Pay ₹550 Now
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <p className="text-center text-[10px] text-zinc-400 font-medium mt-3 uppercase tracking-widest">
            SSL Encrypted Secure Transaction
          </p>
        </div>
      </div>
    </div>
  )
}
