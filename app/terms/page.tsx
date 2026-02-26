import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Terms and Conditions - PolyTrax',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-base font-medium">Terms and Conditions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-8 text-muted-foreground text-sm leading-relaxed">
          <p className="text-xs text-muted-foreground/60">Last updated: February 25, 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PolyTrax (&quot;the Service&quot;), you agree to be bound by these
              Terms and Conditions. If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">2. Description of Service</h2>
            <p>
              PolyTrax provides real-time monitoring of publicly available wallet activity on
              prediction markets, including trade notifications and activity tracking. The Service
              aggregates publicly available blockchain data and delivers notifications based on
              user-configured preferences.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">3. Account and Subscription</h2>
            <p>
              You must create an account to use the Service. You are responsible for maintaining the
              confidentiality of your account credentials and for all activity under your account.
            </p>
            <p>
              Paid subscriptions are billed on a recurring basis. You may cancel your subscription at
              any time through your account settings. Cancellation takes effect at the end of the
              current billing period. Refunds are not provided for partial billing periods.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble the Service</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Resell, redistribute, or sublicense access to the Service without written permission</li>
              <li>Use automated tools to scrape or extract data from the Service beyond normal use</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">5. Data and Privacy</h2>
            <p>
              PolyTrax collects and stores your email address, account information, and notification
              preferences. Wallet addresses you track are stored to provide the Service. We do not
              sell your personal data to third parties.
            </p>
            <p>
              The Service monitors publicly available blockchain data. No private wallet information
              is accessed or stored beyond what is publicly available on-chain.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
              either express or implied. PolyTrax does not guarantee that the Service will be
              uninterrupted, error-free, or completely secure.
            </p>
            <p>
              PolyTrax does not provide financial, investment, or trading advice. Wallet activity
              data and notifications are for informational purposes only. You are solely responsible
              for any decisions you make based on information provided by the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, PolyTrax and its operators shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, including
              but not limited to loss of profits, data, or other intangible losses resulting from
              your use of or inability to use the Service.
            </p>
            <p>
              In no event shall PolyTrax&apos;s total liability exceed the amount you paid for the
              Service in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">8. Modifications to the Service and Terms</h2>
            <p>
              PolyTrax reserves the right to modify, suspend, or discontinue the Service at any time
              without prior notice. We may also update these Terms from time to time. Continued use
              of the Service after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion if you
              violate these Terms or engage in conduct that we determine to be harmful to the Service
              or other users.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-foreground">10. Contact</h2>
            <p>
              If you have questions about these Terms, please contact us at{' '}
              <a
                href="mailto:polytraxapp@gmail.com"
                className="text-accent hover:underline"
              >
                polytraxapp@gmail.com
              </a>.
            </p>
          </section>
        </div>

        {/* Fine print */}
        <p className="mt-16 text-xs text-muted-foreground/60">
          PolyTrax is an independent project and is not associated with, endorsed by, or affiliated with Polymarket in any way.
        </p>
      </main>
    </div>
  )
}
