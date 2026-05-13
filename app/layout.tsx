import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://kawaiicouple.roastlabai.com'),
  title: 'Kawaii Couple - Play Mini Games with Your Babe ♡',
  description: 'Play 5 kawaii mini games with your partner and find out who wins today! Free 2-player browser game - no download needed. Share an invite code and play from different devices~ ✿',
  keywords: ['couple games', 'kawaii', 'mini games', '2 player', 'couple activities', 'online couple game', 'free couple game'],
  openGraph: {
    title: 'Kawaii Couple - Play Mini Games with Your Babe ♡',
    description: 'Play 5 kawaii mini games with your partner! Share an invite code, play from different devices, find out who wins today~ ✿',
    url: 'https://kawaiicouple.roastlabai.com',
    siteName: 'Kawaii Couple',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kawaii Couple - Play Mini Games with Your Babe',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kawaii Couple - Play Mini Games with Your Babe ♡',
    description: 'Play 5 kawaii mini games with your partner! Free, no download~ ✿',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {ADSENSE_PUB_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
