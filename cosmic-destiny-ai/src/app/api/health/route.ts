import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 基础健康检查
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || 'unknown',
      uptime: process.uptime(),
      checks: {
        api: 'healthy',
        database: 'checking',
      }
    }

    // 检查数据库连接
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single()
      
      health.checks.database = error ? 'unhealthy' : 'healthy'
      if (error) {
        health.status = 'degraded'
      }
    } catch (dbError) {
      health.checks.database = 'unhealthy'
      health.status = 'unhealthy'
    }

    // 计算响应时间
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      ...health,
      responseTime: `${responseTime}ms`
    }, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      responseTime: `${Date.now() - startTime}ms`
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  }
}
