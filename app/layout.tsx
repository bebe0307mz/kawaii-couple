import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kawaii Couple - Play 5 Mini Games with Your Babe',
  description: 'A cute 2-player couple mini games website. Play 5 kawaii mini games with your partner! (◕‿◕)✿',
  openGraph: {
    title: 'Kawaii Couple',
    description: 'Play 5 kawaii mini games with your babe! (◕‿◕)✿',
    url: 'https://kawaiicouple.roastlabai.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
