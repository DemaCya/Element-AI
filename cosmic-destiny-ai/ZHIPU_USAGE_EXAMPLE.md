# 智谱AI集成使用示例

## 🎯 快速测试

### 1. 设置环境变量

```bash
# 在项目根目录创建 .env.local 文件
echo "ZHIPU_API_KEY=your_actual_api_key_here" > .env.local
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试API连接

```bash
# 测试基本连接
curl http://localhost:3000/api/test-zhipu

# 预期响应
{
  "success": true,
  "message": "智谱AI连接测试成功",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 4. 测试报告生成

```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthData": {
      "birthDate": "1990-01-01",
      "birthTime": "12:00",
      "timeZone": "Asia/Shanghai",
      "gender": "male",
      "isTimeKnownInput": true
    },
    "reportName": "测试报告"
  }'
```

## 📋 集成完成清单

✅ **已完成的功能**:

1. **智谱AI SDK安装** - 使用 `zhipuai` 包
2. **服务类创建** - `ZhipuService` 封装API调用
3. **环境变量配置** - 添加 `ZHIPU_API_KEY` 支持
4. **报告生成API集成** - 修改 `/api/reports/generate` 使用智谱AI
5. **测试API创建** - `/api/test-zhipu` 用于测试连接
6. **降级机制** - API失败时自动使用模拟报告
7. **类型安全** - 完整的TypeScript类型定义
8. **错误处理** - 完善的错误处理和日志记录

## 🔧 核心功能

### ZhipuService 类

```typescript
// 初始化服务
const zhipuService = new ZhipuService()

// 生成八字报告
const report = await zhipuService.generateBaziReport(
  birthData,    // 出生信息
  baziData,     // 八字数据
  false         // 是否为预览版
)

// 测试连接
const isConnected = await zhipuService.testConnection()
```

### 报告生成流程

1. **接收请求** - 用户提交出生信息
2. **计算八字** - 使用 `BaziService` 计算八字数据
3. **AI生成** - 使用智谱AI生成专业报告
4. **返回结果** - 返回预览版和完整版报告

### 降级机制

如果智谱AI不可用，系统会：
- 记录错误日志
- 自动切换到模拟报告生成
- 返回模拟数据给用户
- 确保服务不中断

## 🎨 报告内容示例

智谱AI生成的报告包含：

```
# 您的命理分析报告

## 出生信息
- 出生日期：1990-01-01
- 出生时间：12:00 (用户提供)
- 性别：男
- 时区：Asia/Shanghai

## 八字分析
- 年柱：甲子
- 月柱：乙丑  
- 日柱：丙寅
- 时柱：丁卯

## 性格特质分析
基于您的八字分析，您的日主为丙，这赋予了您...

## 事业运势指导
根据您的五行配置，最适合您的职业方向是...

## 感情婚姻分析
在感情方面，您追求精神层面的共鸣...

## 健康养生建议
根据您的五行配置，您的体质特点如下...

## 人生发展建议
基于以上全面的分析，为您提供以下综合建议...
```

## 🚀 部署注意事项

1. **环境变量**: 确保生产环境设置了 `ZHIPU_API_KEY`
2. **API配额**: 监控智谱AI的API使用量
3. **错误监控**: 设置错误监控和告警
4. **性能优化**: 考虑添加缓存机制
5. **安全**: 确保API密钥安全存储

## 📞 技术支持

如果遇到问题：

1. 检查API密钥是否正确
2. 查看控制台日志
3. 运行测试脚本
4. 检查网络连接
5. 联系技术支持

---

**恭喜！** 🎉 智谱AI已成功集成到您的项目中，现在可以生成专业的八字命理分析报告了！
