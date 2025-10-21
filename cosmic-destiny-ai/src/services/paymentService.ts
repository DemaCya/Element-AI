/**
 * Creem Payment Service - Simplified MVP Version
 * 
 * This service handles creating checkout sessions with Creem.
 * Payment verification is done via webhook, not here.
 */

// --- Environment Configuration ---
const IS_TEST_MODE = process.env.CREEM_MODE === 'test'

// Base URLs now correctly use the official test endpoint
const CREEM_API_BASE_PROD = 'https://api.creem.io/v1'
const CREEM_API_BASE_TEST = 'https://test-api.creem.io/v1' // Correct endpoint from official docs

// Select configuration based on mode
const CREEM_API_BASE = IS_TEST_MODE ? CREEM_API_BASE_TEST : CREEM_API_BASE_PROD
const CREEM_API_KEY = IS_TEST_MODE 
  ? process.env.CREEM_API_KEY_TEST || '' 
  : process.env.CREEM_API_KEY || ''
const CREEM_PRODUCT_ID = IS_TEST_MODE 
  ? process.env.CREEM_PRODUCT_ID_TEST || '' 
  : process.env.CREEM_PRODUCT_ID || ''

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000')

// Helper to mask API key for logging
const maskApiKey = (key: string) => {
  if (!key) return 'Not Set'
  if (key.length <= 8) return '********'
  return `${key.slice(0, 4)}...${key.slice(-4)}`
}

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
      // Log configuration
      console.log('[Creem] Initializing checkout with config:', {
        apiKeySet: maskApiKey(CREEM_API_KEY),
        productIdSet: CREEM_PRODUCT_ID ? 'Set' : 'Not Set',
        appUrl: APP_URL
      })


      // Validate configuration
      if (!CREEM_API_KEY) {
        console.error('[Creem] API key not configured')
        return {
          success: false,
          error: 'Payment system not configured: Missing API Key. Please contact support.'
        }
      }

      if (!CREEM_PRODUCT_ID) {
        console.error('[Creem] Product ID not configured')
        return {
          success: false,
          error: 'Payment system not configured: Missing Product ID. Please contact support.'
        }
      }

      console.log('[Creem] Creating checkout for report:', params.reportId)

      const body = {
        product_id: CREEM_PRODUCT_ID,
        // Restore optional parameters now that the root cause is fixed.
        request_id: params.reportId,
        success_url: `${APP_URL}/report?id=${params.reportId}`,
        // The API rejected this parameter, so it's removed.
        // customer_email: params.userEmail,
      }

      console.log('[Creem] Sending request to Creem with body:', JSON.stringify(body, null, 2));

      // Call Creem API
      const response = await fetch(`${CREEM_API_BASE}/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CREEM_API_KEY
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => response.text())
        console.error('[Creem] API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        })
        const errorMessage = typeof errorBody === 'object' && errorBody !== null && 'error' in errorBody && typeof errorBody.error === 'string'
          ? errorBody.error
          : 'Failed to create payment session. Please check server logs.'

        return {
          success: false,
          error: `Creem API Error: ${errorMessage}`
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
      console.error('--- [Creem] UNEXPECTED FETCH ERROR ---');
      console.error('[Creem] This indicates a potential network issue or a problem with the fetch call itself.');
      
      if (error instanceof Error) {
        console.error('[Creem] Error Name:', error.name);
        console.error('[Creem] Error Message:', error.message);
        console.error('[Creem] Error Stack:', error.stack);
      } else {
        console.error('[Creem] Caught a non-Error object:', error);
      }
      
      try {
        console.error('[Creem] Serialized Error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      } catch (e) {
        console.error('[Creem] Could not serialize the error object.');
      }
      
      console.error('--- [Creem] END UNEXPECTED FETCH ERROR ---');

      return {
        success: false,
        error: 'An unexpected error occurred while creating the payment session. Please try again.'
      }
    }
  }
}

export default CreemPaymentService
