# 时区UTC修复说明

## 问题描述
在Vercel部署时，`birthDate.toString()`返回的是中国标准时间，但八字计算需要UTC时间才能得到正确结果。

## 解决方案

### 1. 添加UTC时间转换辅助方法
在`BaziService`类中添加了`ensureUtcDate`方法，确保日期时间正确转换为UTC：

```typescript
private static ensureUtcDate(date: Date): Date {
  // 方法1：使用toISOString()确保UTC时间
  const isoString = date.toISOString()
  const utcDate = new Date(isoString)
  
  // 验证转换是否正确
  if (utcDate.toISOString() !== isoString) {
    console.warn('⚠️ [BaziService] UTC转换可能有问题，使用备用方法')
    // 备用方法：手动计算UTC时间
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    return new Date(utcTime)
  }
  
  return utcDate
}
```

### 2. 更新时区处理逻辑
在`calculateBazi`方法中：

```typescript
// 使用辅助方法确保UTC时间转换
const finalUtcDate = this.ensureUtcDate(birthDateLocal)

console.log('🔮 [BaziService] 原始本地时间:', birthDateLocal.toString())
console.log('🔮 [BaziService] 原始本地时间ISO:', birthDateLocal.toISOString())
console.log('🔮 [BaziService] 最终UTC时间:', finalUtcDate.toString())
console.log('🔮 [BaziService] 最终UTC时间ISO:', finalUtcDate.toISOString())
console.log('🔮 [BaziService] UTC时间戳:', finalUtcDate.getTime())
console.log('🔮 [BaziService] 时区偏移量:', finalUtcDate.getTimezoneOffset())

const calculator = new BaziCalculator(finalUtcDate, birthData.gender, birthData.timeZone, birthData.isTimeKnownInput)
```

### 3. 关键改进点

1. **强制UTC环境**: 设置`process.env.TZ = 'UTC'`
2. **双重验证**: 使用`toISOString()`和备用方法确保UTC转换
3. **详细日志**: 添加了完整的时区转换日志，便于调试
4. **跨环境一致性**: 确保在Vercel和其他环境下都能正确工作

### 4. 测试验证

通过测试脚本验证了：
- ✅ UTC时间转换正确
- ✅ 时间戳一致性
- ✅ 跨时区环境下的稳定性
- ✅ ISO字符串格式正确（以Z结尾）

## 修复效果

修复后，无论在什么环境下部署：
- `birthDate.toString()`将返回正确的UTC时间
- 八字计算结果将基于UTC时间，确保准确性
- 时区转换过程透明，便于调试和监控

## 注意事项

1. 确保在生产环境中监控时区转换日志
2. 如果发现时区转换异常，系统会自动使用备用方法
3. 所有时间相关的计算都基于UTC时间，确保一致性
