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
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { reportId } = body

    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      )
    }

    // Verify the report exists and belongs to the user
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      console.error('[Payment] Report not found:', reportError)
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    // Check if report is already paid
    if (report.is_paid) {
      return NextResponse.json(
        { success: false, error: 'Report is already unlocked' },
        { status: 400 }
      )
    }

    // Create checkout session with Creem
    const checkoutResult = await CreemPaymentService.createCheckout({
      reportId: report.id,
      userId: user.id,
      userEmail: user.email
    })

    if (!checkoutResult.success) {
      console.error('[Payment] Failed to create checkout:', checkoutResult.error)
      return NextResponse.json(
        {
          success: false,
          error: checkoutResult.error || 'Failed to create payment session'
        },
        { status: 500 }
      )
    }

    // Store payment record in database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        report_id: report.id,
        checkout_id: checkoutResult.checkoutId!,
        amount: 19.99, // Default price, should match Creem product price
        currency: 'USD',
        status: 'pending',
        payment_provider: 'creem',
        metadata: {
          checkout_url: checkoutResult.checkoutUrl,
          created_at: new Date().toISOString()
        }
      })

    if (paymentError) {
      console.error('[Payment] Failed to store payment record:', paymentError)
      // Don't fail the request, checkout is already created
    }

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

