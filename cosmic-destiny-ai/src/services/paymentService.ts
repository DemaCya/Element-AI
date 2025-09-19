import { createClient } from '@/lib/supabase/client'

interface PaymentData {
  reportId: string
  amount: number
  currency: string
  userId: string
  userEmail: string
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}

export class PaymentService {
  private static readonly CREEM_API_KEY = process.env.NEXT_PUBLIC_CREEM_API_KEY || ''
  private static readonly CREEM_SECRET_KEY = process.env.CREEM_SECRET_KEY || ''

  static async createPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // For now, create a placeholder payment record
      // This will be replaced with actual Creem integration
      const supabase = createClient()

      const { data, error } = await supabase
        .from('payments')
        .insert({
          report_id: paymentData.reportId,
          user_id: paymentData.userId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'pending',
          payment_method: 'creem',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating payment record:', error)
        return { success: false, error: 'Failed to create payment record' }
      }

      // Simulate payment process (replace with actual Creem integration)
      const paymentResult = await this.simulateCreemPayment(paymentData, data.id)

      if (paymentResult.success) {
        // Update payment record to completed
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            payment_id: paymentResult.paymentId,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)

        // Update user report to paid
        await supabase
          .from('user_reports')
          .update({
            is_paid: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentData.reportId)

        return { success: true, paymentId: paymentResult.paymentId }
      } else {
        // Update payment record to failed
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            error_message: paymentResult.error,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)

        return { success: false, error: paymentResult.error }
      }

    } catch (error) {
      console.error('Payment processing error:', error)
      return { success: false, error: 'Payment processing failed' }
    }
  }

  private static async simulateCreemPayment(paymentData: PaymentData, paymentRecordId: string): Promise<PaymentResult> {
    // This is a placeholder for Creem integration
    // In a real implementation, this would:
    // 1. Create a payment session with Creem
    // 2. Redirect user to Creem payment page
    // 3. Handle webhook for payment completion
    // 4. Verify payment with Creem API

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate successful payment (in real implementation, this would be based on Creem's response)
    const isSuccess = Math.random() > 0.1 // 90% success rate for demo

    if (isSuccess) {
      return {
        success: true,
        paymentId: `creem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.'
      }
    }
  }

  static async verifyPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single()

      if (error || !data) {
        return { success: false, error: 'Payment not found' }
      }

      if (data.status === 'completed') {
        return { success: true, paymentId: data.payment_id }
      } else if (data.status === 'failed') {
        return { success: false, error: data.error_message || 'Payment failed' }
      } else {
        return { success: false, error: 'Payment is still processing' }
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      return { success: false, error: 'Verification failed' }
    }
  }

  static async createPaymentSession(reportId: string, userId: string): Promise<{
    success: boolean
    sessionId?: string
    checkoutUrl?: string
    error?: string
  }> {
    try {
      const supabase = createClient()

      // Get report details
      const { data: report, error: reportError } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single()

      if (reportError || !report) {
        return { success: false, error: 'Report not found' }
      }

      // Get user email
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user?.email) {
        return { success: false, error: 'User not found' }
      }

      // Create payment data
      const paymentData: PaymentData = {
        reportId,
        amount: 19.99, // Fixed price
        currency: 'USD',
        userId,
        userEmail: userData.user.email
      }

      // For now, return simulated checkout URL
      // This will be replaced with actual Creem checkout URL
      const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const checkoutUrl = `${window.location.origin}/api/checkout?session_id=${sessionId}`

      return {
        success: true,
        sessionId,
        checkoutUrl
      }

    } catch (error) {
      console.error('Payment session creation error:', error)
      return { success: false, error: 'Failed to create payment session' }
    }
  }

  static async handleWebhook(payload: any): Promise<void> {
    try {
      // This would handle Creem webhooks for payment completion
      // For now, we'll simulate webhook processing

      const { event, data } = payload

      if (event === 'payment.completed') {
        const supabase = createClient()

        // Update payment record
        await supabase
          .from('payments')
          .update({
            status: 'completed',
            payment_id: data.payment_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.metadata.payment_record_id)

        // Update user report to paid
        await supabase
          .from('user_reports')
          .update({
            is_paid: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.metadata.report_id)
      }

    } catch (error) {
      console.error('Webhook handling error:', error)
      throw error
    }
  }
}