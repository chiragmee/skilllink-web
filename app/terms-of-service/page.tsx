import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — SkillLink',
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="fixed top-0 w-full flex items-center gap-4 px-6 py-3 glass-nav z-50">
        <Link href="/" className="p-2 hover:bg-zinc-100 rounded-full">
          <span className="material-symbols-outlined text-indigo-700">arrow_back</span>
        </Link>
        <span className="text-xl font-bold text-indigo-800 font-headline">Terms of Service</span>
      </header>

      <main className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <p className="text-xs text-zinc-400 mb-8">Last updated: April 2026</p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">1. About SkillLink</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          SkillLink is an online marketplace that connects individuals seeking to learn skills
          (&quot;Learners&quot;) with individuals who offer to teach them (&quot;Experts&quot;).
          SkillLink is a platform — it does not itself provide the skills or guarantee the quality
          of sessions beyond what is represented by expert profiles and reviews.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">2. Platform Commission</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          SkillLink charges a <strong>15% platform commission</strong> on every completed session.
          This fee is deducted from the payment before the expert&apos;s payout is processed.
          The learner sees the total price inclusive of this fee. There are no additional hidden charges.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">3. Booking Policy</h2>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-2">
          <li><strong>Slot reservation:</strong> When a learner initiates checkout, the time slot is held for 10 minutes. If payment is not completed, the slot is released.</li>
          <li><strong>Confirmation:</strong> A booking is confirmed only after payment is successfully captured.</li>
          <li><strong>Expert acceptance:</strong> Experts may reject booking requests; in such cases, a full refund is issued automatically.</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">4. Cancellation & Refund Policy</h2>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-2">
          <li><strong>Learner cancels &gt;24 hours before session:</strong> Full refund within 5–7 business days.</li>
          <li><strong>Learner cancels &lt;24 hours before session:</strong> 50% refund. The remaining 50% compensates the expert for blocked time.</li>
          <li><strong>Expert cancels:</strong> Full refund to learner. Repeated cancellations (3+ in 30 days) may result in expert account review.</li>
          <li><strong>No-show by expert:</strong> Full refund to learner + no-show flag on expert profile.</li>
          <li><strong>No-show by learner:</strong> No refund. The expert is paid in full.</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">5. User Responsibilities</h2>
        <ul className="text-zinc-600 text-sm leading-relaxed space-y-2">
          <li>Experts must accurately represent their qualifications and experience.</li>
          <li>Experts must not solicit off-platform payments from learners.</li>
          <li>Learners must not record sessions without explicit expert consent.</li>
          <li>Both parties must behave professionally and respectfully.</li>
          <li>SkillLink prohibits any content or sessions that are illegal, harmful, or discriminatory.</li>
        </ul>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">6. Dispute Resolution</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          If a dispute arises between a learner and an expert, either party may contact
          support@skilllink.in within 48 hours of the session. SkillLink will review evidence
          from both parties and make a final decision within 5 business days. SkillLink&apos;s
          decision is binding.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">7. Account Termination</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          SkillLink may suspend or terminate accounts that violate these terms, engage in fraud,
          or receive repeated low ratings or complaints. Users may also delete their own account
          at any time from the profile settings.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">8. Limitation of Liability</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          SkillLink is a marketplace platform. We are not liable for any injury, loss, or damage
          arising from sessions conducted between experts and learners. Users participate at their
          own risk and are encouraged to meet in safe, public locations for offline sessions.
        </p>

        <h2 className="text-xl font-bold font-headline mt-8 mb-3">9. Contact</h2>
        <p className="text-zinc-600 text-sm leading-relaxed">
          For any questions about these terms:{' '}
          <span className="text-indigo-700 font-medium">support@skilllink.in</span>
        </p>

        <div className="mt-12 pt-8 border-t border-zinc-100 flex gap-6">
          <Link href="/privacy-policy" className="text-indigo-700 text-sm font-medium hover:underline">
            Privacy Policy →
          </Link>
          <Link href="/" className="text-zinc-400 text-sm hover:underline">
            Back to SkillLink
          </Link>
        </div>
      </main>
    </div>
  )
}
