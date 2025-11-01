import { NextRequest } from 'next/server'
import { ZhipuService } from '@/services/zhipuService'
import { BaziService } from '@/services/baziService'
import { createClient } from '@/lib/supabase/server'
import { BirthData } from '@/types'

export const dynamic = 'force-dynamic'

// 预览边界字符数
const PREVIEW_BOUNDARY = 1800

// 分批存储间隔：每3000字符或30秒
const BATCH_SAVE_CHAR_THRESHOLD = 3000
const BATCH_SAVE_TIME_THRESHOLD = 30000 // 30秒

/**
 * POST /api/reports/generate-stream
 * 流式生成报告并实时更新数据库
 */
export async function POST(request: NextRequest) {
  const isStaticMode = process.env.DEPLOYMENT_MODE === 'static'
  
  if (isStaticMode) {
    return new Response(
      JSON.stringify({ 
        error: 'API disabled for static deployment',
        message: 'This is a static demo version. All API endpoints are disabled.',
        status: 'demo_mode'
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const { reportId, birthData } = body

    if (!reportId || !birthData) {
      return new Response(
        JSON.stringify({ error: 'Missing reportId or birthData' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('🚀 [Stream API] Starting streaming generation for report:', reportId)

    // 检查智谱AI API密钥
    if (!process.env.ZHIPU_API_KEY) {
      console.warn('⚠️ [Stream API] ZHIPU_API_KEY not found')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 计算八字数据
    console.log('🔮 [Stream API] Calculating Bazi data...')
    const baziData = await BaziService.calculateBazi(birthData)
    console.log('✅ [Stream API] Bazi data calculated')

    // 创建流式响应
    const encoder = new TextEncoder()
    let fullContent = ''
    let previewContent = ''
    let lastSaveLength = 0
    let lastSaveTime = Date.now()
    let previewBoundaryReached = false

    // 创建一个标志来跟踪客户端连接状态
    let clientConnected = true
    
    // 创建ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        // 后台任务：独立运行，不受前端连接影响
        const backgroundTask = async () => {
          try {
            const zhipuService = new ZhipuService()
            
            // 开始流式生成 - 这个循环会一直执行，即使前端断开
            for await (const chunk of zhipuService.generateBaziReportStream(birthData, baziData)) {
              fullContent += chunk
              
              // 处理预览边界
              if (!previewBoundaryReached && fullContent.length >= PREVIEW_BOUNDARY) {
                previewBoundaryReached = true
                previewContent = fullContent.substring(0, PREVIEW_BOUNDARY)
                
                // 优化截断点（寻找段落边界）
                const lastParagraphEnd = Math.max(
                  previewContent.lastIndexOf('\n\n'),
                  previewContent.lastIndexOf('。'),
                  previewContent.lastIndexOf('！'),
                  previewContent.lastIndexOf('？')
                )
                
                if (lastParagraphEnd > PREVIEW_BOUNDARY * 0.7) {
                  previewContent = previewContent.substring(0, lastParagraphEnd + 1)
                }
                
                // 添加预览结尾
                previewContent += '\n\n---\n\n**Want to learn more?**\n\nThe full report includes:\n- In-depth personality analysis and growth advice\n- Detailed career planning and wealth strategies\n- Comprehensive relationship analysis and best matches\n- Life mission and key turning points\n- Personalized health and wellness plans\n- Detailed analysis of Luck Pillars and Annual Cycles\n- In-depth interpretation of favorable and unfavorable factors\n- And much more guidance tailored to you...\n\nUnlock the full report now to begin your journey of destiny exploration!'
                
                // 保存预览版 - 这个操作会继续执行，即使前端断开
                try {
                  await supabase
                    .from('user_reports')
                    .update({ 
                      preview_report: previewContent,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', reportId)
                  
                  console.log('📝 [Stream API] Preview saved at', fullContent.length, 'characters')
                } catch (saveError) {
                  console.error('❌ [Stream API] Failed to save preview:', saveError)
                  // 继续执行，不中断
                }
              }
              
              // 分批保存完整报告 - 这个操作会继续执行，即使前端断开
              const shouldSave = 
                (fullContent.length - lastSaveLength >= BATCH_SAVE_CHAR_THRESHOLD) ||
                (Date.now() - lastSaveTime >= BATCH_SAVE_TIME_THRESHOLD)
              
              if (shouldSave) {
                try {
                  await supabase
                    .from('user_reports')
                    .update({ 
                      full_report: fullContent,
                      updated_at: new Date().toISOString()
                    })
                    .eq('id', reportId)
                  
                  lastSaveLength = fullContent.length
                  lastSaveTime = Date.now()
                  console.log('💾 [Stream API] Batch saved at', fullContent.length, 'characters')
                } catch (saveError) {
                  console.error('❌ [Stream API] Failed to save batch:', saveError)
                  // 继续传输，不中断
                }
              }
              
              // 尝试发送数据到前端 - 如果连接断开，会失败但不影响后台任务
              if (clientConnected) {
                try {
                  const message = JSON.stringify({
                    type: 'chunk',
                    content: chunk,
                    totalLength: fullContent.length,
                    isPreviewComplete: previewBoundaryReached
                  })
                  controller.enqueue(encoder.encode(`data: ${message}\n\n`))
                } catch (enqueueError) {
                  // 连接已断开，但继续执行后台任务
                  console.log('⚠️ [Stream API] Client disconnected, continuing background task...')
                  clientConnected = false
                  // 不中断循环，继续接收和保存数据
                }
              } else {
                // 客户端已断开，继续后台任务但不再尝试发送
                console.log('📡 [Stream API] Client disconnected, skipping enqueue for chunk at', fullContent.length, 'characters')
              }
            }

            // 流式传输完成，最终保存 - 即使前端断开也会执行
            if (fullContent.length > lastSaveLength) {
              try {
                await supabase
                  .from('user_reports')
                  .update({ 
                    full_report: fullContent,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', reportId)
                
                console.log('✅ [Stream API] Final save complete, total length:', fullContent.length)
              } catch (saveError) {
                console.error('❌ [Stream API] Failed to save final report:', saveError)
              }
            }

            // 尝试发送完成消息（如果客户端还在）
            if (clientConnected) {
              try {
                const doneMessage = JSON.stringify({
                  type: 'done',
                  totalLength: fullContent.length
                })
                controller.enqueue(encoder.encode(`data: ${doneMessage}\n\n`))
                controller.close()
              } catch (closeError) {
                console.log('⚠️ [Stream API] Client disconnected before sending done message')
              }
            }
          } catch (error) {
            console.error('❌ [Stream API] Error in stream generation:', error)
            
            // 即使出错，也尝试保存已接收的内容
            if (fullContent.length > 0) {
              try {
                await supabase
                  .from('user_reports')
                  .update({ 
                    full_report: fullContent,
                    preview_report: previewContent || fullContent.substring(0, PREVIEW_BOUNDARY),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', reportId)
                console.log('💾 [Stream API] Saved partial content due to error, length:', fullContent.length)
              } catch (saveError) {
                console.error('❌ [Stream API] Failed to save partial content:', saveError)
              }
            }
            
            // 尝试发送错误消息（如果客户端还在）
            if (clientConnected) {
              try {
                const errorMessage = JSON.stringify({
                  type: 'error',
                  error: error instanceof Error ? error.message : 'Unknown error'
                })
                controller.enqueue(encoder.encode(`data: ${errorMessage}\n\n`))
                controller.close()
              } catch (closeError) {
                console.log('⚠️ [Stream API] Client disconnected before sending error message')
              }
            }
          }
        }
        
        // 启动后台任务 - 这个任务会一直运行，不受前端连接影响
        backgroundTask().catch(err => {
          console.error('❌ [Stream API] Fatal error in background task:', err)
        })
      },
      
      // 当客户端断开连接时的处理
      cancel() {
        console.log('📡 [Stream API] Client connection cancelled, but background task continues...')
        clientConnected = false
        // 注意：我们不在这里做任何操作，让后台任务继续运行
        // ReadableStream的cancel只是通知服务器客户端断开，不会中断后台异步任务
      }
    })

    // 返回SSE响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // 禁用Nginx缓冲
      }
    })

  } catch (error) {
    console.error('❌ [Stream API] Error setting up stream:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to set up stream',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

