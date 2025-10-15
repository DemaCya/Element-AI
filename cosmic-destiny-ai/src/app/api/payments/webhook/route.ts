import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payment = Database['public']['Tables']['payments']['Row']
type UserReport = Database['public']['Tables']['user_reports']['Row']

// Create Supabase admin client - lazy initialization to avoid build-time errors
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured')
  }
  
  return createClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * POST /api/payments/webhook
 * 
 * Receives payment notifications from Creem
 * When payment succeeds, automatically unlocks the report
 * 
 * Creem will retry failed webhooks automatically
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { event, data } = payload

    console.log('[Webhook] Received event:', event)

    // Only handle successful payments for MVP
    if (event === 'payment.success' || event === 'payment.completed') {
      await handlePaymentSuccess(data)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Webhook] Error:', error)
    // Still return 200 to prevent retries for invalid requests
    return NextResponse.json({ received: true }, { status: 200 })
  }
}

/**
 * Handle successful payment
 * 1. Find the payment record
 * 2. Update payment status
 * 3. Unlock the report
 */
async function handlePaymentSuccess(data: any) {
  try {
    const { checkout_id, order_id, request_id } = data
    const reportId = request_id // We use reportId as request_id

    console.log('[Webhook] Payment success:', {
      checkout_id,
      order_id,
      report_id: reportId
    })

    const supabaseAdmin = getSupabaseAdmin()

    // Find payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('checkout_id', checkout_id)
      .maybeSingle() as { data: Payment | null, error: any }

    if (paymentError) {
      console.error('[Webhook] Error fetching payment:', paymentError)
    }

    // Check if already processed (idempotency)
    if (payment?.status === 'completed') {
      console.log('[Webhook] Already processed, skipping')
      return
    }

    // Update payment status
    if (payment) {
      await supabaseAdmin
        .from('payments')
        // @ts-expect-error - Supabase type inference issue with update
        .update({
          status: 'completed',
          order_id: order_id
        })
        .eq('id', payment.id)
    }

    // Get the report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .maybeSingle() as { data: UserReport | null, error: any }

    if (reportError || !report) {
      console.error('[Webhook] Report not found:', reportId, reportError)
      return
    }

    // Unlock the report
    // Note: Full report generation happens on-demand when user views the report
    // This keeps the webhook fast and reliable
    await supabaseAdmin
      .from('user_reports')
      // @ts-expect-error - Supabase type inference issue with update
      .update({ is_paid: true })
      .eq('id', reportId)

    console.log('[Webhook] Report unlocked successfully')

  } catch (error) {
    console.error('[Webhook] Error processing payment:', error)
    throw error
  }
}
