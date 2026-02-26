import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About Us - PolyTrax',
}

export default function AboutPage() {
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
          <h1 className="text-base font-medium">About Us</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">PolyTrax</h2>
            <p className="text-muted-foreground leading-relaxed">
              PolyTrax is a real-time wallet monitoring tool for prediction markets.
              We help you track wallet activity and get instant notifications on trades
              so you never miss a move.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Contact Us</h3>
            <p className="text-muted-foreground">
              Have questions, feedback, or need support? Reach out to us at{' '}
              <a
                href="mailto:polytraxapp@gmail.com"
                className="text-accent hover:underline"
              >
                polytraxapp@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Fine print */}
        <div className="mt-16 space-y-2">
          <p className="text-xs text-muted-foreground/60">
            PolyTrax is an independent project and is not associated with, endorsed by, or affiliated with Polymarket in any way.
          </p>
          <p className="text-xs">
            <Link href="/terms" className="text-accent hover:underline">Terms and Conditions</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
