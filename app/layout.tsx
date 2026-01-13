import type { Metadata } from 'next'
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
