/**
 * Creem Payment Service - Simplified MVP Version
 * 
 * This service handles creating checkout sessions with Creem.
 * Payment verification is done via webhook, not here.
 */

const CREEM_API_BASE = 'https://api.creem.io/v1'
const CREEM_API_KEY = process.env.CREEM_API_KEY || process.env.CREEM_API_KEY_TEST || ''
const CREEM_PRODUCT_ID = process.env.CREEM_PRODUCT_ID || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface CreateCheckoutParams {
  reportId: string
  userId: string
  userEmail?: string
}

interface CheckoutResult {
  success: boolean
  checkoutUrl?: string
  checkoutId?: string
  error?: string
}

export class CreemPaymentService {
  /**
   * Create a Creem checkout session
   * This redirects the user to Creem's payment page
   */
  static async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResult> {
    try {
      // Validate configuration
      if (!CREEM_API_KEY) {
        console.error('[Creem] API key not configured')
        return {
          success: false,
          error: 'Payment system not configured. Please contact support.'
        }
      }

      if (!CREEM_PRODUCT_ID) {
        console.error('[Creem] Product ID not configured')
        return {
          success: false,
          error: 'Product not configured. Please contact support.'
        }
      }

      console.log('[Creem] Creating checkout for report:', params.reportId)

      // Call Creem API
      const response = await fetch(`${CREEM_API_BASE}/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CREEM_API_KEY
        },
        body: JSON.stringify({
          product_id: CREEM_PRODUCT_ID,
          request_id: params.reportId, // Use reportId to track this payment
          success_url: `${APP_URL}/payment/success`,
          customer_email: params.userEmail
          // 注意：Creem API 不支持 cancel_url 参数
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Creem] API error:', response.status, errorText)
        return {
          success: false,
          error: 'Failed to create payment session. Please try again.'
        }
      }

      const data = await response.json()

      console.log('[Creem] Checkout created:', data.checkout_id)

      return {
        success: true,
        checkoutUrl: data.checkout_url,
        checkoutId: data.checkout_id
      }

    } catch (error) {
      console.error('[Creem] Error creating checkout:', error)
      return {
        success: false,
        error: 'Failed to create payment session. Please try again.'
      }
    }
  }
}

export default CreemPaymentService
