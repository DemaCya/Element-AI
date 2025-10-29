import { NextRequest, NextResponse } from 'next/server'

// 内存中存储进度信息（生产环境建议使用Redis）
const progressStore = new Map<string, {
  progress: number
  status: string
  message: string
  timestamp: number
}>()

// 清理过期进度（超过10分钟）
function cleanupExpiredProgress() {
  const now = Date.now()
  const tenMinutes = 10 * 60 * 1000
  
  for (const [key, value] of progressStore.entries()) {
    if (now - value.timestamp > tenMinutes) {
      progressStore.delete(key)
    }
  }
}

// 设置进度
export async function POST(request: NextRequest) {
  try {
    const { sessionId, progress, status, message } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    // 清理过期进度
    cleanupExpiredProgress()
    
    // 更新进度
    progressStore.set(sessionId, {
      progress: Math.max(0, Math.min(100, progress || 0)),
      status: status || 'processing',
      message: message || '',
      timestamp: Date.now()
    })
    
    console.log(`📊 [Progress] Updated progress for ${sessionId}: ${progress}% - ${status} - ${message}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Progress updated successfully' 
    })
    
  } catch (error) {
    console.error('❌ [Progress] Error updating progress:', error)
    return NextResponse.json({
      error: 'Failed to update progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 获取进度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    // 清理过期进度
    cleanupExpiredProgress()
    
    const progressData = progressStore.get(sessionId)
    
    if (!progressData) {
      return NextResponse.json({ 
        error: 'Progress not found',
        message: 'Progress data not found or expired'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      sessionId,
      progress: progressData.progress,
      status: progressData.status,
      message: progressData.message,
      timestamp: progressData.timestamp
    })
    
  } catch (error) {
    console.error('❌ [Progress] Error getting progress:', error)
    return NextResponse.json({
      error: 'Failed to get progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 删除进度
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const deleted = progressStore.delete(sessionId)
    
    if (deleted) {
      console.log(`🗑️ [Progress] Deleted progress for ${sessionId}`)
      return NextResponse.json({ 
        success: true, 
        message: 'Progress deleted successfully' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Progress not found',
        message: 'Progress data not found'
      }, { status: 404 })
    }
    
  } catch (error) {
    console.error('❌ [Progress] Error deleting progress:', error)
    return NextResponse.json({
      error: 'Failed to delete progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
