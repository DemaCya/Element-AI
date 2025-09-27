import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // 检查是否是测试报告ID
    if (id.startsWith('test-')) {
      console.log('🧪 [Testing Mode] 获取测试报告:', id)

      // 从内存中获取测试报告
      const testReport = typeof global !== 'undefined'
        ? (global as any).testReports?.[id]
        : null

      if (testReport && testReport.user_id === user.id) {
        return NextResponse.json({
          success: true,
          report: testReport,
          isTestMode: true
        })
      } else {
        return NextResponse.json({ error: 'Test report not found or unauthorized' }, { status: 404 })
      }
    }

    // 获取报告数据
    const { data: report, error: dbError } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      
      // 如果是表不存在的错误，返回特定的错误信息
      if (dbError.code === 'PGRST205' || dbError.message?.includes('user_reports')) {
        return NextResponse.json({ 
          error: 'Database table not found', 
          message: '数据库表尚未创建。请参考文档创建必要的数据库表。',
          code: 'TABLE_NOT_FOUND'
        }, { status: 503 })
      }
      
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      report 
    })

  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
