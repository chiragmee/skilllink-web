import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — SkillLink',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="fixed top-0 w-full flex items-center gap-4 px-6 py-3 glass-nav z-50">
        <Link href="/" className="p-2 hover:bg-zinc-100 rounded-full">
          <span className="material-symbols-outlined text-indigo-700">arrow_back</span>
        </Link>
        <span className="text-xl font-bold text-indigo-800 font-headline">Privacy Policy</span>
      </header>

      <main className="pt-24 pb-16 px-6 max-w-2xl mx-auto prose prose-zinc">
        <p className="text-xs text-zinc-400 mb-8">Last updated: April 2026</p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">1. What We Collect</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          When you use SkillLink, we collect the following information:
        </p>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-1 mt-2">
          <li><strong>Account data:</strong> Name, email address, phone number, profile photo</li>
          <li><strong>Location data:</strong> City / approximate location for expert discovery (not GPS-tracked continuously)</li>
          <li><strong>Payment data:</strong> Transaction amounts, Razorpay order/payment IDs (we do NOT store card numbers or UPI credentials)</li>
          <li><strong>Usage data:</strong> Pages visited, searches, bookings made</li>
          <li><strong>Device data:</strong> Device type, browser, OS for app compatibility</li>
          <li><strong>Push notification tokens:</strong> FCM tokens to send booking reminders</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">2. How We Use Your Data</h2>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-1">
          <li>Matching learners with relevant experts based on skill and location</li>
          <li>Processing bookings and payments</li>
          <li>Sending booking confirmations, reminders, and updates via push/SMS</li>
          <li>Calculating and collecting platform commission (15% per transaction)</li>
          <li>Resolving disputes and preventing fraud</li>
          <li>Improving the platform through aggregated analytics</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">3. Third-Party Services</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          We use the following third-party services, each with their own privacy policy:
        </p>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-1 mt-2">
          <li><strong>Supabase</strong> — database and authentication (supabase.com/privacy)</li>
          <li><strong>Razorpay</strong> — payment processing (razorpay.com/privacy)</li>
          <li><strong>Firebase (Google)</strong> — push notifications (firebase.google.com/support/privacy)</li>
          <li><strong>Render</strong> — API server hosting (render.com/privacy)</li>
          <li><strong>Vercel</strong> — web hosting (vercel.com/legal/privacy-policy)</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">4. Data Retention</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          We retain your data for as long as your account is active. Booking and payment records are
          retained for 7 years to comply with Indian financial regulations. You may request deletion
          of your account at any time — contact us at privacy@skilllink.in.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">5. Your Rights</h2>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-1">
          <li>Access a copy of your data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and associated data</li>
          <li>Opt out of marketing communications</li>
          <li>Port your data to another service</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">6. Cookies</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          We use only essential session cookies for authentication. We do not use tracking or
          advertising cookies.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">7. Contact</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          For privacy-related questions, contact us at:{' '}
          <span className="text-indigo-700 font-medium">privacy@skilllink.in</span>
        </p>
      </main>
    </div>
  )
}
