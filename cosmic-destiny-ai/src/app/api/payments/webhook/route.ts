import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { geminiService } from '@/services/geminiService'
import type { Database } from '@/lib/database.types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Create Supabase admin client for server-side operations
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

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
 * 4. Generate full report (if needed)
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

    // Find payment record
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('checkout_id', checkout_id)
      .single()

    // Check if already processed (idempotency)
    if (payment?.status === 'completed') {
      console.log('[Webhook] Already processed, skipping')
      return
    }

    // Update payment status
    if (payment) {
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'completed',
          order_id: order_id
        })
        .eq('id', payment.id)
    }

    // Get the report
    const { data: report } = await supabaseAdmin
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (!report) {
      console.error('[Webhook] Report not found:', reportId)
      return
    }

    // Generate full report if not already generated (optional)
    let fullReport = report.full_report
    const hasGeminiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY && 
                         process.env.NEXT_PUBLIC_GEMINI_API_KEY !== 'your_gemini_api_key'

    if (!fullReport && hasGeminiKey) {
      console.log('[Webhook] Generating full report with Gemini...')
      
      try {
        fullReport = await geminiService.generateFullReport({
          name: report.name,
          birthDate: report.birth_date,
          birthTime: report.birth_time,
          birthLocation: report.birth_location,
          timezone: report.timezone,
          isTimeKnown: report.is_time_known
        })
        console.log('[Webhook] Full report generated successfully')
      } catch (error) {
        console.error('[Webhook] Failed to generate report:', error)
        console.log('[Webhook] Will mark as paid anyway, report can be generated later')
      }
    } else if (!hasGeminiKey) {
      console.log('[Webhook] Gemini API key not configured, skipping report generation')
      console.log('[Webhook] Report will be marked as paid, but no content generated yet')
    }

    // Unlock the report (with or without full content)
    const updateData: any = { is_paid: true }
    if (fullReport) {
      updateData.full_report = fullReport
    }

    await supabaseAdmin
      .from('user_reports')
      .update(updateData)
      .eq('id', reportId)

    console.log('[Webhook] Report unlocked successfully')

  } catch (error) {
    console.error('[Webhook] Error processing payment:', error)
    throw error
  }
}
