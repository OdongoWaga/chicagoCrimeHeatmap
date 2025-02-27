'use client'

import './globals.css'
import type { Metadata } from 'next'
import { MotherDuckClientProvider } from '@/lib/motherduck/context/motherduckClientContext'
import { TimeProvider } from '@/contexts/TimeContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MotherDuckClientProvider>
          <TimeProvider>
            {children}
          </TimeProvider>
        </MotherDuckClientProvider>
      </body>
    </html>
  )
}
