import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Kawaii Couple - Play Mini Games with Your Babe'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FFF0F5',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          border: '12px solid #FF69B4',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🌸 💝 🌸</div>
        <div style={{ fontSize: 90, fontWeight: 'bold', color: '#FF1493', marginBottom: 20 }}>
          Kawaii Couple
        </div>
        <div style={{ fontSize: 42, color: '#C084FC', fontWeight: 'bold', marginBottom: 16 }}>
          Play 5 mini games with your babe ♡
        </div>
        <div style={{ fontSize: 30, color: '#FF69B4' }}>
          kawaiicouple.roastlabai.com
        </div>
        <div style={{ fontSize: 50, marginTop: 24 }}>💝 🌸 ✿ ♡ ★ ✿ 🌸 💝</div>
      </div>
    ),
    { ...size }
  )
}
