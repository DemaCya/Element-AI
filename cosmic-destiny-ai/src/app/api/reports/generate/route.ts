import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BaziService } from '@/services/baziService'
import { GeminiService } from '@/services/geminiService'
import { BirthData } from '@/types'

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
    const { birthDate, birthTime, timeZone, gender } = body

    if (!birthDate || !timeZone || !gender) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 准备出生数据
    const birthData: BirthData = {
      birthDate,
      birthTime: birthTime || '',
      timeZone,
      gender: gender as 'male' | 'female' | 'other'
    }

    // 计算八字
    const baziData = await BaziService.calculateBazi(birthData)

    // 调用Gemini API生成报告
    const reportContent = await GeminiService.generateComprehensiveReport(birthData, baziData)

    // 准备存储到数据库的数据
    const reportData = {
      user_id: user.id,
      birth_date: birthData.birthDate,
      birth_time: birthData.birthTime || null,
      timezone: birthData.timeZone,
      gender: birthData.gender,
      bazi_data: baziData,
      full_report: reportContent,
      preview_report: {
        personality: reportContent.personality.substring(0, 200) + '...',
        career: reportContent.career.substring(0, 200) + '...',
        relationships: reportContent.relationships.substring(0, 200) + '...',
        lifePath: reportContent.lifePath.substring(0, 200) + '...',
        health: reportContent.health.substring(0, 200) + '...'
      },
      is_paid: false
    }

    // 保存到数据库
    const { data: report, error: dbError } = await supabase
      .from('user_reports')
      .insert(reportData)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
    }

    // 返回报告ID
    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report generated successfully'
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
