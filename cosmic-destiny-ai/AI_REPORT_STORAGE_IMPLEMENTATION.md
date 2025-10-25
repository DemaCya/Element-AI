# AI报告存储实现方案

## 概述

根据用户需求，实现了基于AI生成的报告存储方案，其中：
1. 用户点击生成报告后，调用Google Gemini API生成完整报告
2. 完整报告存储在数据库的`full_report`字段
3. 从完整报告中截取一部分作为演示报告，存储在`preview_report`字段

## 实现细节

### 1. 数据流程

```
用户输入出生信息 
    ↓
计算八字数据 (BaziService)
    ↓
调用Gemini AI生成完整报告 (GeminiService.generateSingleComprehensiveReport)
    ↓
从完整报告中提取预览版本 (extractPreviewFromFullReport)
    ↓
分别存储到数据库 (full_report 和 preview_report 字段)
```

### 2. 关键文件修改

#### `/src/app/generate/page.tsx`
- 导入真实的AI服务：`GeminiService` 和 `BaziService`
- 替换模拟数据生成，使用真实的AI生成
- 实现报告分割逻辑：`extractPreviewFromFullReport()`
- 更新数据库存储，分别存储完整报告和预览报告

#### `/src/app/api/reports/generate/route.ts`
- 添加AI服务导入
- 实现真实的报告生成流程
- 添加报告分割功能
- 返回完整报告和预览报告

### 3. 报告分割逻辑

```typescript
function extractPreviewFromFullReport(fullReport: string): string {
  const targetLength = 900
  let preview = fullReport.substring(0, targetLength)
  
  // 在句子或段落边界处截断
  const lastSentenceEnd = Math.max(
    preview.lastIndexOf('。'),
    preview.lastIndexOf('！'),
    preview.lastIndexOf('？'),
    preview.lastIndexOf('\n\n')
  )
  
  if (lastSentenceEnd > targetLength * 0.7) {
    preview = preview.substring(0, lastSentenceEnd + 1)
  }
  
  // 添加预览结束提示
  preview += `\n\n---\n\n**想要了解更多详细内容吗？**\n\n完整报告包含：...`
  
  return preview
}
```

### 4. 数据库存储结构

在 `user_reports` 表中：
- `full_report`: 存储完整的AI生成报告（3000+字）
- `preview_report`: 存储截取的预览报告（800-1000字）
- `is_paid`: 标识是否已付费解锁完整报告

### 5. 用户体验流程

1. **免费用户**：
   - 看到预览报告（截取的前800-1000字）
   - 显示升级提示，引导付费解锁完整报告

2. **付费用户**：
   - 看到完整的AI生成报告
   - 包含所有详细分析内容

### 6. 技术优势

- **真实AI生成**：使用Google Gemini API生成个性化报告
- **智能分割**：在句子边界截断，保持内容完整性
- **数据完整性**：完整报告和预览报告都存储在数据库中
- **用户体验**：预览版本吸引用户，完整版本提供价值

## 使用说明

1. 确保环境变量中配置了 `NEXT_PUBLIC_GEMINI_API_KEY`
2. 用户填写出生信息后，系统会：
   - 计算八字数据
   - 调用AI生成完整报告
   - 自动截取预览版本
   - 存储到数据库
3. 用户可以在报告页面看到预览内容，付费后解锁完整报告

## 注意事项

- AI生成需要时间，建议添加适当的加载状态
- 报告分割逻辑可以根据需要调整截取长度
- 确保数据库字段类型支持长文本存储
- 考虑添加错误处理和重试机制
