import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Payment = Database['public']['Tables']['payments']['Row']
type UserReport = Database['public']['Tables']['user_reports']['Row']

// Create Supabase admin client - lazy initialization to avoid build-time errors
function getSupabaseAdmin(): any {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured')
  }
  
  return createClient(
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

    console.log('[Webhook] ========== Webhook Received ==========')
    console.log(`[Webhook] Timestamp: ${new Date().toISOString()}`)
    console.log('[Webhook] Event Type:', event)
    console.log('[Webhook] Full Payload:', JSON.stringify(payload, null, 2))


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
async function handlePaymentSuccess(data: any): Promise<void> {
  try {
    const { checkout_id, order_id, request_id, customer_email, amount_total } = data
    const reportId = request_id // We use reportId as request_id

    console.log('[Webhook] Processing payment.success event with data:', {
      checkout_id,
      order_id,
      report_id: reportId
    })

    // --- 关键诊断：检查环境变量 ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    console.log('[Webhook] Supabase Env Check:', {
      isUrlSet: !!supabaseUrl,
      isServiceKeySet: !!supabaseKey,
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Webhook] CRITICAL: Supabase server environment variables are not set!')
      // 抛出错误，让 Vercel 记录下来，并让 Creem 重试
      throw new Error('Supabase environment variables are not configured on the server.')
    }

    const supabaseAdmin = getSupabaseAdmin()

    // --- 新逻辑：不再依赖预先创建的支付记录 ---

    // 1. 获取报告和用户信息
    console.log(`[Webhook] Step 1: Fetching report with ID: ${reportId}`)
    const { data: report, error: reportError }: PostgrestSingleResponse<UserReport> = await supabaseAdmin
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      console.error('[Webhook] Report not found or failed to fetch:', { reportId, error: reportError })
      // 如果报告不存在，我们无法继续，但仍需返回成功以免Creem重试
      return
    }
    
    console.log(`[Webhook] Report found:`, { reportId: report.id, is_paid: report.is_paid })

    // 幂等性检查：如果报告已经支付，则跳过
    if (report.is_paid) {
      console.log('[Webhook] Idempotency Check: Report already marked as paid. Skipping.', { reportId })
      return
    }

    // 2. 解锁报告
    console.log(`[Webhook] Step 2: Attempting to unlock report with ID: ${reportId}`)
    const { error: updateReportError } = await supabaseAdmin
      .from('user_reports')
      .update({ is_paid: true, updated_at: new Date().toISOString() })
      .eq('id', reportId)

    if (updateReportError) {
      console.error('[Webhook] CRITICAL: Failed to unlock report! This needs manual intervention.', { reportId, error: updateReportError })
      // 抛出错误，让Creem重试
      throw new Error(`Failed to unlock report ${reportId}`)
    }

    console.log('[Webhook] Report unlocked successfully:', { reportId })

    // 3. 创建或更新支付记录
    console.log(`[Webhook] Step 3: Upserting payment record for checkout_id: ${checkout_id}`)
    // 使用 upsert 保证数据一致性，如果记录已存在则更新，不存在则创建
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .upsert({
        checkout_id: checkout_id, // 主键/唯一键
        user_id: report.user_id,
        report_id: report.id,
        amount: amount_total ? amount_total / 100 : 19.99, // Creem通常以分为单位
        currency: 'usd',
        status: 'completed',
        payment_provider: 'creem',
        order_id: order_id
      }, {
        onConflict: 'checkout_id'
      })

    if (paymentError) {
      console.error('[Webhook] Warning: Failed to create or update payment record. Report was unlocked.', { checkout_id, reportId, error: paymentError })
      // 这不是致命错误，因为报告已经解锁，所以我们不抛出错误
    } else {
      console.log('[Webhook] Payment record created/updated successfully:', { checkout_id })
    }

    console.log('[Webhook] ========== Webhook Processing Finished ==========')

  } catch (error) {
    console.error('[Webhook] Uncaught error in handlePaymentSuccess:', error)
    // 将错误向上抛出，以便Vercel记录并让Creem重试
    throw error
  }
}
