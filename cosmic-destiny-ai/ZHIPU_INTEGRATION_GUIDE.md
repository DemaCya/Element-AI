# 智谱AI集成指南

本项目已成功集成智谱AI，用于生成专业的个人成长分析报告。

## 🚀 快速开始

### 1. 获取智谱AI API密钥

1. 访问 [智谱AI开放平台](https://bigmodel.cn/)
2. 注册账号并登录
3. 在 [API Keys页面](https://bigmodel.cn/usercenter/proj-mgmt/apikeys) 创建API密钥
4. 复制您的API密钥

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```bash
# 智谱AI API密钥
ZHIPU_API_KEY=your_zhipu_api_key_here
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 📁 文件结构

```
src/
├── services/
│   └── zhipuService.ts          # 智谱AI服务类
├── app/api/
│   ├── reports/generate/route.ts # 报告生成API（已集成智谱AI）
│   └── test-zhipu/route.ts      # 智谱AI测试API
└── ...

test-zhipu-integration.js        # 集成测试脚本
```

## 🔧 API使用

### 智谱AI服务类 (ZhipuService)

```typescript
import { ZhipuService } from '@/services/zhipuService'

const zhipuService = new ZhipuService()

// 生成八字报告
const report = await zhipuService.generateBaziReport(birthData, baziData, isPreview)

// 测试连接
const isConnected = await zhipuService.testConnection()
```

### 报告生成API

**端点**: `POST /api/reports/generate`

**请求体**:
```json
{
  "birthData": {
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "timeZone": "Asia/Shanghai",
    "gender": "male",
    "isTimeKnownInput": true
  },
  "reportName": "我的分析报告"
}
```

**响应**:
```json
{
  "success": true,
  "reportId": "report-1234567890-abc123",
  "previewReport": "预览报告内容...",
  "fullReport": "完整报告内容...",
  "message": "AI报告生成成功",
  "source": "zhipu-ai"
}
```

## 🧪 测试

### 1. 测试API连接

```bash
curl http://localhost:3000/api/test-zhipu
```

### 2. 测试内容生成

```bash
curl -X POST http://localhost:3000/api/test-zhipu \
  -H "Content-Type: application/json" \
  -d '{"testPrompt": "请介绍八字命理学"}'
```

### 3. 运行集成测试

```bash
# 确保开发服务器正在运行
npm run dev

# 在另一个终端运行测试
node test-zhipu-integration.js
```

## 📊 功能特性

### ✅ 已实现功能

- [x] 智谱AI SDK集成
- [x] 八字数据计算
- [x] AI报告生成（预览版和完整版）
- [x] 错误处理和降级机制
- [x] API测试端点
- [x] 集成测试脚本

### 🎯 报告内容

AI生成的报告包含以下部分：

1. **出生信息概览** - 用户提供的出生数据
2. **八字分析** - 天干地支、五行、日主等专业分析
3. **性格特质分析** - 基于八字的性格特征解读
4. **职业发展分析** - 职业发展和财富建议
5. **感情婚姻分析** - 感情模式和配对建议
6. **健康养生建议** - 体质分析和养生指导
7. **人生发展建议** - 人生规划和成长建议
8. **综合总结** - 整体建议和总结

### 🔄 降级机制

如果智谱AI服务不可用，系统会自动降级到模拟报告生成：

- API密钥未配置 → 使用模拟报告
- 网络连接失败 → 使用模拟报告
- API调用超时 → 使用模拟报告
- 其他错误 → 使用模拟报告

## 🛠️ 配置选项

### 环境变量

| 变量名 | 描述 | 必需 | 默认值 |
|--------|------|------|--------|
| `ZHIPU_API_KEY` | 智谱AI API密钥 | 是 | - |
| `DEPLOYMENT_MODE` | 部署模式 | 否 | `dynamic` |

### 智谱AI参数

| 参数 | 描述 | 预览版 | 完整版 |
|------|------|--------|--------|
| `model` | 使用的模型 | `glm-4.6` | `glm-4.6` |
| `temperature` | 创造性参数 | `0.7` | `0.7` |
| `max_tokens` | 最大token数 | `2000` | `4000` |

## 🐛 故障排除

### 常见问题

1. **API密钥错误**
   ```
   Error: ZHIPU_API_KEY environment variable is not set
   ```
   **解决方案**: 检查 `.env.local` 文件中的API密钥配置

2. **网络连接失败**
   ```
   Error: Connection test failed
   ```
   **解决方案**: 检查网络连接和防火墙设置

3. **API配额不足**
   ```
   Error: Rate limit exceeded
   ```
   **解决方案**: 检查智谱AI账户的API使用配额

4. **报告生成失败**
   ```
   Error: AI generation failed, falling back to mock reports
   ```
   **解决方案**: 检查API密钥和网络连接，系统会自动使用模拟报告

### 调试模式

启用详细日志：

```bash
DEBUG=zhipu:* npm run dev
```

## 📈 性能优化

1. **缓存机制**: 考虑添加报告缓存以减少API调用
2. **并发控制**: 限制同时进行的API请求数量
3. **超时设置**: 设置合理的API调用超时时间
4. **错误重试**: 实现指数退避重试机制

## 🔒 安全考虑

1. **API密钥保护**: 不要在客户端代码中暴露API密钥
2. **输入验证**: 验证用户输入的出生数据
3. **速率限制**: 实施API调用频率限制
4. **日志安全**: 避免在日志中记录敏感信息

## 📞 支持

如果遇到问题，请：

1. 查看控制台日志
2. 运行集成测试脚本
3. 检查智谱AI服务状态
4. 联系技术支持

---

**注意**: 本集成基于智谱AI的 `glm-4.6` 模型，确保您的API密钥有足够的配额和权限。
