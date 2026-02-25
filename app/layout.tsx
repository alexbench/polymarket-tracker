import type { Metadata } from 'next'
import Script from 'next/script'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'PolyTrax',
  description: 'Track Polymarket wallet trades and get instant notifications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17975232074"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17975232074');
          `}
        </Script>
      </head>
      <body>
        <SessionProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#141414',
                border: '1px solid #262626',
                color: '#fafafa',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  )
}
