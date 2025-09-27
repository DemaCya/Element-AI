import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreemService } from '@/services/creemService'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 获取请求数据
    const body = await request.json()
    const { reportId } = body

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 })
    }

    // 验证报告是否存在且属于当前用户
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .select('id, user_id, is_paid')
      .eq('id', reportId)
      .eq('user_id', user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (report.is_paid) {
      return NextResponse.json({ error: 'Report is already paid' }, { status: 400 })
    }

    // 创建 Creem 结账会话
    const result = await CreemService.createCheckoutSession({
      reportId,
      userId: user.id,
      userEmail: user.email || '',
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/report/${reportId}?payment=success`
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to create checkout session' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
