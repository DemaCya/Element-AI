import { NextRequest, NextResponse } from 'next/server'
import { CreemService } from '@/services/creemService'

export async function POST(request: NextRequest) {
  try {
    // 获取请求体
    const payload = await request.json()
    
    console.log('🔔 Creem webhook received:', {
      eventType: payload.eventType,
      id: payload.id,
      timestamp: new Date(payload.created_at).toISOString()
    })

    // 验证 webhook 来源（可选但推荐）
    const signature = request.headers.get('x-creem-signature') || request.headers.get('creem-signature')
    if (!signature) {
      console.warn('⚠️ No signature found in webhook request')
    }

    // 处理 webhook 事件
    const result = await CreemService.handleWebhook(payload, signature || undefined)

    if (result.success) {
      console.log('✅ Webhook processed successfully')
      return NextResponse.json({ success: true })
    } else {
      console.error('❌ Webhook processing failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Webhook processing failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// 处理 GET 请求（用于 webhook 验证）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    // 返回 challenge 以验证 webhook 端点
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({ message: 'Creem webhook endpoint is active' })
}
