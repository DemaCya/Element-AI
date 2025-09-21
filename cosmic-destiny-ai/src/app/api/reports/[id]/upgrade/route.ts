import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BaziService } from '@/services/baziService'
import { GeminiService } from '@/services/geminiService'
import { BirthData } from '@/types'

// 生成模拟的完整报告（测试用）
function generateMockFullReport(birthData: BirthData, baziData: any): string {
  // 这里可以导入主文件中的 generateMockReport 函数，现在先简单处理
  return `# 宇宙命理分析报告（完整版）

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '12:00'}
- 性别：${birthData.gender === 'male' ? '男' : '女'}

## 一、深度人格分析
[这里是3000+字的完整报告内容...]

基于您的八字分析，这是您的完整命理报告。感谢您的信任和支持！

## 二、职业发展详解
[详细的职业分析内容...]

## 三、情感关系深度解析
[详细的情感分析内容...]

## 四、人生使命与灵魂成长
[详细的人生使命分析...]

## 五、健康养生完整方案
[详细的健康养生建议...]

## 六、综合建议与人生规划
[详细的综合建议...]

---
*感谢您解锁完整报告，愿这份报告能够为您的人生带来指引和帮助。*`
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查是否是测试报告
    if (params.id.startsWith('test-')) {
      // 从内存中获取测试报告
      const testReport = typeof global !== 'undefined' 
        ? (global as any).testReports?.[params.id]
        : null
      
      if (!testReport || testReport.user_id !== user.id) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }

      // 生成完整报告
      const birthData: BirthData = {
        birthDate: testReport.birth_date,
        birthTime: testReport.birth_time || '',
        timeZone: testReport.timezone,
        gender: testReport.gender as 'male' | 'female',
        isTimeKnownInput: testReport.is_time_known_input
      }

      const fullReport = generateMockFullReport(birthData, testReport.bazi_data)
      
      // 更新内存中的报告
      testReport.full_report = fullReport
      testReport.is_paid = true
      testReport.updated_at = new Date().toISOString()
      
      return NextResponse.json({ 
        success: true, 
        message: 'Report upgraded successfully (test mode)',
        report: testReport
      })
    }

    // 获取现有报告
    const { data: existingReport, error: fetchError } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // 如果已经是付费报告，直接返回
    if (existingReport.is_paid && existingReport.full_report) {
      return NextResponse.json({ 
        success: true, 
        message: 'Report already upgraded',
        report: existingReport
      })
    }

    // 准备出生数据
    const birthData: BirthData = {
      birthDate: existingReport.birth_date,
      birthTime: existingReport.birth_time || '',
      timeZone: existingReport.timezone,
      gender: existingReport.gender as 'male' | 'female',
      isTimeKnownInput: existingReport.is_time_known_input
    }

    // 生成完整报告
    // TODO: 恢复API调用（当有API Key时）
    // const fullReport = await GeminiService.generateSingleComprehensiveReport(birthData, existingReport.bazi_data)
    const fullReport = generateMockFullReport(birthData, existingReport.bazi_data)

    // 更新数据库
    const { data: updatedReport, error: updateError } = await supabase
      .from('user_reports')
      .update({
        full_report: fullReport,
        is_paid: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report upgraded successfully',
      report: updatedReport
    })

  } catch (error) {
    console.error('Error upgrading report:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
