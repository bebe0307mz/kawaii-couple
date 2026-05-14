import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (e) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = (session as { metadata?: { userId?: string } }).metadata?.userId
    const paymentStatus = (session as { payment_status?: string }).payment_status

    if (userId && paymentStatus === 'paid') {
      const supabase = createServerSupabaseClient()
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { theme_pack: true },
      })
    }
  }

  return NextResponse.json({ received: true })
}
