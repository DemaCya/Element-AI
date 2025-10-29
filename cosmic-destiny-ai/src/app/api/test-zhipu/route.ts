import { NextRequest, NextResponse } from 'next/server'
import { ZhipuService } from '@/services/zhipuService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 [TestAPI] Testing ZhipuAI connection...')
    
    // 检查API密钥
    if (!process.env.ZHIPU_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'ZHIPU_API_KEY not configured',
        message: '智谱AI API密钥未配置'
      }, { status: 400 })
    }

    // 测试连接
    const zhipuService = new ZhipuService()
    const isConnected = await zhipuService.testConnection()
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '智谱AI连接测试成功',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        message: '智谱AI连接测试失败'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [TestAPI] Error testing ZhipuAI:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: '测试失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testPrompt = '你好，请简单介绍一下自己。' } = body

    console.log('🧪 [TestAPI] Testing ZhipuAI with custom prompt...')
    
    // 检查API密钥
    if (!process.env.ZHIPU_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'ZHIPU_API_KEY not configured',
        message: '智谱AI API密钥未配置'
      }, { status: 400 })
    }

    // 测试生成内容
    const zhipuService = new ZhipuService()
    // 使用公共方法而不是直接访问私有属性
    const testBirthData = {
      birthDate: '1990-01-01',
      birthTime: '12:00',
      timeZone: 'Asia/Shanghai',
      gender: 'male' as const,
      isTimeKnownInput: true
    }
    const testBaziData = {
      dayMaster: '甲',
      heavenlyStems: ['甲', '乙', '丙', '丁'],
      earthlyBranches: ['子', '丑', '寅', '卯'],
      elements: { wood: 2, fire: 1, earth: 1, metal: 1, water: 1 },
      yearPillar: '甲子',
      monthPillar: '乙丑',
      dayPillar: '丙寅',
      hourPillar: '丁卯',
      dayMasterNature: 'Yang' as const,
      dayMasterElement: 'WOOD' as const,
      hiddenStems: []
    }
    
    const content = await zhipuService.generateBaziReport(testBirthData, testBaziData)

    if (content) {
      return NextResponse.json({
        success: true,
        message: '智谱AI测试成功',
        response: content,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'No response content',
        message: '未收到响应内容'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ [TestAPI] Error testing ZhipuAI:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: '测试失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
