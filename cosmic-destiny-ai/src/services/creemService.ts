import { createClient } from '@/lib/supabase/client'

export interface CreemProduct {
  id: string
  name: string
  description: string
  price: number
  currency: string
  type: 'one_time' | 'recurring'
}

export interface CreemCheckoutSession {
  id: string
  checkout_url: string
  product_id: string
  request_id?: string
  metadata?: Record<string, any>
  success_url?: string
  created_at: string
}

export interface CreemWebhookEvent {
  id: string
  eventType: 'checkout.completed' | 'subscription.active' | 'subscription.paid' | 'subscription.canceled'
  created_at: number
  object: {
    id: string
    object: string
    request_id?: string
    order?: {
      id: string
      customer: string
      product: string
      amount: number
      currency: string
      status: 'paid' | 'pending' | 'failed'
      type: 'one_time' | 'recurring'
      created_at: string
      updated_at: string
    }
    customer?: {
      id: string
      email: string
      name?: string
    }
    product?: {
      id: string
      name: string
      description: string
    }
    subscription?: {
      id: string
      status: 'active' | 'canceled' | 'paused'
      current_period_start: string
      current_period_end: string
    }
    metadata?: Record<string, any>
  }
}

export class CreemService {
  private static readonly API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://api.creem.io/v1'
    : 'https://api.creem.io/v1' // 使用相同的API，通过API key区分测试/生产环境
  
  private static readonly API_KEY = process.env.CREEM_API_KEY || ''
  private static readonly WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || ''

  // 产品配置
  private static readonly PRODUCTS = {
    COSMIC_REPORT: {
      id: process.env.CREEM_PRODUCT_ID || 'prod_cosmic_report',
      name: '宇宙命理完整报告',
      description: '深度命理分析报告，包含人格特质、职业指导、感情分析、人生使命等全方位内容',
      price: 1999, // 19.99 USD in cents
      currency: 'USD',
      type: 'one_time' as const
    }
  }

  /**
   * 创建结账会话
   */
  static async createCheckoutSession(params: {
    reportId: string
    userId: string
    userEmail: string
    successUrl?: string
  }): Promise<{ success: boolean; checkoutUrl?: string; sessionId?: string; error?: string }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const product = this.PRODUCTS.COSMIC_REPORT
      const requestId = `report_${params.reportId}_${Date.now()}`
      
      const checkoutData = {
        product_id: product.id,
        request_id: requestId,
        success_url: params.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/report/${params.reportId}?payment=success`,
        metadata: {
          report_id: params.reportId,
          user_id: params.userId,
          user_email: params.userEmail,
          payment_type: 'cosmic_report'
        }
      }

      const response = await fetch(`${this.API_BASE_URL}/checkouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY
        },
        body: JSON.stringify(checkoutData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Creem API error: ${errorData.message || response.statusText}`)
      }

      const checkoutSession: CreemCheckoutSession = await response.json()

      // 保存结账会话信息到数据库
      await this.saveCheckoutSession({
        sessionId: checkoutSession.id,
        reportId: params.reportId,
        userId: params.userId,
        requestId,
        status: 'pending'
      })

      return {
        success: true,
        checkoutUrl: checkoutSession.checkout_url,
        sessionId: checkoutSession.id
      }

    } catch (error) {
      console.error('Error creating Creem checkout session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session'
      }
    }
  }

  /**
   * 保存结账会话信息
   */
  private static async saveCheckoutSession(data: {
    sessionId: string
    reportId: string
    userId: string
    requestId: string
    status: 'pending' | 'completed' | 'failed'
  }) {
    try {
      const supabase = createClient()
      
      await supabase
        .from('checkout_sessions')
        .insert({
          session_id: data.sessionId,
          report_id: data.reportId,
          user_id: data.userId,
          request_id: data.requestId,
          status: data.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error saving checkout session:', error)
    }
  }

  /**
   * 处理 webhook 事件
   */
  static async handleWebhook(payload: CreemWebhookEvent, signature?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 验证 webhook 签名（可选，但推荐）
      if (signature && !this.verifyWebhookSignature(payload, signature)) {
        throw new Error('Invalid webhook signature')
      }

      const { eventType, object } = payload

      switch (eventType) {
        case 'checkout.completed':
          await this.handleCheckoutCompleted(object)
          break
        case 'subscription.active':
        case 'subscription.paid':
          await this.handleSubscriptionPaid(object)
          break
        case 'subscription.canceled':
          await this.handleSubscriptionCanceled(object)
          break
        default:
          console.log(`Unhandled webhook event type: ${eventType}`)
      }

      return { success: true }

    } catch (error) {
      console.error('Error handling Creem webhook:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook handling failed'
      }
    }
  }

  /**
   * 处理支付完成事件
   */
  private static async handleCheckoutCompleted(object: CreemWebhookEvent['object']) {
    try {
      const supabase = createClient()
      const requestId = object.request_id
      
      if (!requestId) {
        throw new Error('No request_id found in webhook payload')
      }

      // 查找对应的结账会话
      const { data: checkoutSession, error: sessionError } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('request_id', requestId)
        .single()

      if (sessionError || !checkoutSession) {
        throw new Error(`Checkout session not found for request_id: ${requestId}`)
      }

      // 更新结账会话状态
      await supabase
        .from('checkout_sessions')
        .update({
          status: 'completed',
          payment_id: object.order?.id,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('session_id', checkoutSession.session_id)

      // 更新报告为已付费
      await supabase
        .from('user_reports')
        .update({
          is_paid: true,
          payment_id: object.order?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', checkoutSession.report_id)

      // 创建支付记录
      await supabase
        .from('payments')
        .insert({
          report_id: checkoutSession.report_id,
          user_id: checkoutSession.user_id,
          amount: object.order?.amount || 0,
          currency: object.order?.currency || 'USD',
          status: 'completed',
          payment_method: 'creem',
          payment_id: object.order?.id,
          checkout_session_id: checkoutSession.session_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      console.log(`✅ Payment completed for report ${checkoutSession.report_id}`)

    } catch (error) {
      console.error('Error handling checkout completed:', error)
      throw error
    }
  }

  /**
   * 处理订阅支付事件
   */
  private static async handleSubscriptionPaid(object: CreemWebhookEvent['object']) {
    // 如果将来需要订阅功能，可以在这里处理
    console.log('Subscription paid event received:', object)
  }

  /**
   * 处理订阅取消事件
   */
  private static async handleSubscriptionCanceled(object: CreemWebhookEvent['object']) {
    // 如果将来需要订阅功能，可以在这里处理
    console.log('Subscription canceled event received:', object)
  }

  /**
   * 验证 webhook 签名
   */
  private static verifyWebhookSignature(payload: CreemWebhookEvent, signature: string): boolean {
    if (!this.WEBHOOK_SECRET) {
      console.warn('⚠️ Webhook secret not configured, skipping signature verification')
      return true
    }

    try {
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', this.WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex')
      
      return signature === expectedSignature
    } catch (error) {
      console.error('Error verifying webhook signature:', error)
      return false
    }
  }

  /**
   * 获取结账会话状态
   */
  static async getCheckoutSession(sessionId: string): Promise<{
    success: boolean
    session?: any
    error?: string
  }> {
    try {
      if (!this.API_KEY) {
        throw new Error('Creem API key not configured')
      }

      const response = await fetch(`${this.API_BASE_URL}/checkouts/${sessionId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.API_KEY
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch checkout session: ${response.statusText}`)
      }

      const session = await response.json()
      return { success: true, session }

    } catch (error) {
      console.error('Error fetching checkout session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch session'
      }
    }
  }
}
