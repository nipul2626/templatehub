import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'TemplateHub — Production-ready React & Supabase templates',
    template: '%s | TemplateHub',
  },
  description:
    'Buy and sell production-grade React, Next.js, Supabase, and TypeScript templates. Ship faster with battle-tested code.',
  keywords: ['react templates', 'nextjs templates', 'supabase starter', 'typescript boilerplate'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://templatehub.dev',
    siteName: 'TemplateHub',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
