import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreemPaymentService } from '@/services/paymentService'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/payments/create-checkout
 * 
 * Create a Creem checkout session for unlocking a full report
 * 
 * Body:
 * {
 *   reportId: string
 * }
 * 
 * Returns:
 * {
 *   success: boolean
 *   checkoutUrl?: string
 *   checkoutId?: string
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[Payment] ========== Create Checkout Request ==========')
    console.log('[Payment] Timestamp:', new Date().toISOString())
    
    const supabase = await createClient()

    // Check authentication
    console.log('[Payment] Checking authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Payment] Authentication failed:', authError?.message)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[Payment] User authenticated:', user.id)

    // Parse request body
    const body = await request.json()
    const { reportId } = body

    console.log('[Payment] Request body:', { reportId })

    if (!reportId) {
      console.error('[Payment] Missing reportId in request')
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Verify the report exists and belongs to the user
    console.log('[Payment] Verifying report exists and belongs to user...')
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      console.error('[Payment] Report not found or not owned by user')
      console.error('[Payment] Error:', reportError?.message)
      console.error('[Payment] Report ID:', reportId)
      console.error('[Payment] User ID:', user.id)
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    console.log('[Payment] Report found:', {
      id: report.id,
      name: report.report_name,
      isPaid: report.is_paid
    })

    // Check if report is already paid
    if (report.is_paid) {
      console.log('[Payment] Report already paid, rejecting request')
      return NextResponse.json(
        { success: false, error: 'Report is already unlocked' },
        { status: 400 }
      )
    }

    // Create checkout session with Creem
    console.log('[Payment] Calling Creem API to create checkout...')
    const checkoutResult = await CreemPaymentService.createCheckout({
      reportId: report.id,
      userId: user.id,
      userEmail: user.email
    })

    console.log('[Payment] Creem API response:', {
      success: checkoutResult.success,
      hasCheckoutUrl: !!checkoutResult.checkoutUrl,
      error: checkoutResult.error
    })

    if (!checkoutResult.success) {
      console.error('[Payment] Failed to create checkout:', checkoutResult.error)
      console.error('[Payment] This usually means:')
      console.error('[Payment]   - CREEM_API_KEY is not set or invalid')
      console.error('[Payment]   - CREEM_PRODUCT_ID is not set or invalid')
      console.error('[Payment]   - Creem API is down (unlikely)')
      return NextResponse.json(
        {
          success: false,
          error: checkoutResult.error || 'Failed to create payment session'
        },
        { status: 500 }
      )
    }

    /*
    // Store payment record in database
    const { data: insertedPayment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        report_id: report.id,
        checkout_id: checkoutResult.checkoutId!,
        amount: 4.99, // Default price, should match Creem product price
        currency: 'USD',
        status: 'pending',
        payment_provider: 'creem',
        metadata: {
          checkout_url: checkoutResult.checkoutUrl,
          created_at: new Date().toISOString()
        }
      })
      .select()

    if (paymentError) {
      console.error('[Payment] Failed to store payment record:', paymentError)
      // Don't fail the request, checkout is already created 
    } else {
      console.log('[Payment] Successfully stored PENDING payment record:', insertedPayment);
    }
    */

    console.log('[Payment] Checkout created successfully:', {
      reportId: report.id,
      checkoutId: checkoutResult.checkoutId
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutResult.checkoutUrl,
      checkoutId: checkoutResult.checkoutId
    })

  } catch (error) {
    console.error('[Payment] Error in create-checkout:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

