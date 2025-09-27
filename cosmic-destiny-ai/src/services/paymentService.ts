import { createClient } from '@/lib/supabase/client'
import { CreemService } from './creemService'

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
  /**
   * 创建 Creem 支付会话
   */
  static async createCreemPaymentSession(reportId: string, userId: string, userEmail: string): Promise<{
    success: boolean
    checkoutUrl?: string
    sessionId?: string
    error?: string
  }> {
    try {
      const result = await CreemService.createCheckoutSession({
        reportId,
        userId,
        userEmail,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/report/${reportId}?payment=success`
      })

      return result

    } catch (error) {
      console.error('Error creating Creem payment session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment session'
      }
    }
  }

  static async createPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // 使用 Creem 创建支付会话
      const sessionResult = await this.createCreemPaymentSession(
        paymentData.reportId,
        paymentData.userId,
        paymentData.userEmail
      )

      if (!sessionResult.success) {
        return { success: false, error: sessionResult.error }
      }

      // 重定向到 Creem 支付页面
      if (typeof window !== 'undefined' && sessionResult.checkoutUrl) {
        window.location.href = sessionResult.checkoutUrl
      }

      return { success: true, paymentId: sessionResult.sessionId }

    } catch (error) {
      console.error('Payment processing error:', error)
      return { success: false, error: 'Payment processing failed' }
    }
  }

  /**
   * 验证支付状态
   */
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

  /**
   * 创建支付会话（兼容旧接口）
   */
  static async createPaymentSession(reportId: string, userId: string): Promise<{
    success: boolean
    sessionId?: string
    checkoutUrl?: string
    error?: string
  }> {
    try {
      const supabase = createClient()

      // Get user email
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user?.email) {
        return { success: false, error: 'User not found' }
      }

      // 使用 Creem 创建支付会话
      const result = await this.createCreemPaymentSession(
        reportId,
        userId,
        userData.user.email
      )

      return result

    } catch (error) {
      console.error('Payment session creation error:', error)
      return { success: false, error: 'Failed to create payment session' }
    }
  }
}