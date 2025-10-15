# 📝 Next.js API 路由标准模板

## 🎯 快速复制模板

### 标准 API 路由（推荐）

```typescript
import { NextRequest, NextResponse } from 'next/server'

// ✅ 总是添加这两行！
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/your-endpoint
 * 
 * 功能描述
 */
export async function GET(request: NextRequest) {
  try {
    // 你的逻辑

    return NextResponse.json(
      { success: true, data: {} },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API Error]:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/your-endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 你的逻辑

    return NextResponse.json(
      { success: true, data: {} },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API Error]:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
```

---

### 需要认证的 API

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 检查认证
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 你的逻辑
    const body = await request.json()

    return NextResponse.json(
      { success: true, data: {} },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API Error]:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

### 数据库操作 API

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 查询数据库
    const { data, error } = await supabase
      .from('your_table')
      .select('*')

    if (error) {
      throw error
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[DB Error]:', error)
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

---

### 外部 API 调用

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 调用外部 API
    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`External API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[External API Error]:', error)
    
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

---

### Webhook 接收端点

```typescript
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    console.log('[Webhook] Received:', payload)

    // 处理 webhook
    // ...

    // ⚠️ 总是返回 200，即使处理失败
    // 避免第三方服务重试
    return NextResponse.json(
      { received: true },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Webhook Error]:', error)
    
    // 仍然返回 200
    return NextResponse.json(
      { received: true },
      { status: 200 }
    )
  }
}
```

---

## 🎨 Edge Runtime 模板（简单场景）

```typescript
import { NextRequest, NextResponse } from 'next/server'

// Edge Runtime - 用于简单、快速的响应
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 简单逻辑，不依赖 Node.js API
    const data = { message: 'Hello from Edge' }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    )
  }
}
```

---

## 🚨 常见错误

### ❌ 错误 1：忘记 runtime
```typescript
// ❌ 错误
export async function GET() {
  // ...
}
```

```typescript
// ✅ 正确
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  // ...
}
```

### ❌ 错误 2：没有错误处理
```typescript
// ❌ 错误
export async function POST(request: NextRequest) {
  const data = await request.json()
  // 如果 request 不是 JSON，会崩溃
  return NextResponse.json(data)
}
```

```typescript
// ✅ 正确
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }
}
```

### ❌ 错误 3：不返回 NextResponse
```typescript
// ❌ 错误
export async function GET() {
  return { data: 'test' }  // 类型错误
}
```

```typescript
// ✅ 正确
export async function GET() {
  return NextResponse.json({ data: 'test' })
}
```

---

## 📋 部署前检查清单

- [ ] 添加了 `export const runtime = 'nodejs'`
- [ ] 添加了 `export const dynamic = 'force-dynamic'`
- [ ] 使用 `try-catch` 包裹所有逻辑
- [ ] 所有错误都返回 JSON 和正确的状态码
- [ ] 添加了 console.log 方便调试
- [ ] 测试了错误情况（无效输入、未认证等）
- [ ] 环境变量都已在 Vercel 设置

---

## 💡 快速决策树

```
创建 API 路由，问自己：

1. 需要数据库操作？
   → 是：runtime = 'nodejs'

2. 需要调用外部 API？
   → 是：runtime = 'nodejs'

3. 需要复杂计算？
   → 是：runtime = 'nodejs'

4. 只是简单的数据转换？
   → 可以考虑：runtime = 'edge'

5. 不确定？
   → 默认：runtime = 'nodejs'（更安全）
```

---

保存这个模板，每次创建新 API 就复制使用！🚀

