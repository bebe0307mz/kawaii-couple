import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { THEME_PRICE_CENTS } from '@/lib/themes'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

export async function POST(request: Request) {
  try {
    const { userId, userEmail } = await request.json()
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://kawaii-couple.vercel.app'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: THEME_PRICE_CENTS,
            product_data: {
              name: '🎨 Kawaii Theme Pack',
              description: 'Unlock 5 exclusive themes: Sakura Garden, Midnight Romance, Retro Arcade, Winter Wonderland & Strawberry Pop. Yours forever!',
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: userId || '', product: 'theme_pack' },
      success_url: `${origin}/theme/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Stripe error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
