import { NextRequest, NextResponse } from 'next/server'
import { ZhipuService } from '@/services/zhipuService'
import { BaziService } from '@/services/baziService'

export const dynamic = 'force-dynamic'

// Extract preview report from full report (first 1500-2000 characters)
function extractPreviewFromFullReport(fullReport: string): string {
  // Find a good breaking point around 1500-2000 characters
  const targetLength = 1800
  let preview = fullReport.substring(0, targetLength)
  
  // Try to break at a sentence or paragraph boundary
  const lastSentenceEnd = Math.max(
    preview.lastIndexOf('。'),
    preview.lastIndexOf('！'),
    preview.lastIndexOf('？'),
    preview.lastIndexOf('\n\n')
  )
  
  if (lastSentenceEnd > targetLength * 0.7) {
    preview = preview.substring(0, lastSentenceEnd + 1)
  }
  
  // Add preview ending
  preview += `

---

**想要了解更多详细内容吗？**

完整报告包含：
- 深度人格分析和成长建议
- 详细职业规划和财富策略  
- 全面感情分析和最佳配对
- 人生使命和关键转折点
- 个性化健康养生方案
- 大运流年详细分析
- 有利不利因素深度解读
- 以及更多专属于您的命理指导...

立即解锁完整报告，开启您的命运探索之旅！`
  
  return preview
}

// 生成模拟预览报告（测试用，500-800字）
function generateMockPreviewReport(birthData: any, baziData: any): string {
  return `# 您的命理概览

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '12:00'}${birthData.isTimeKnownInput ? ' (用户提供)' : ' (系统默认)'}
- 性别：${birthData.gender === 'male' ? '男' : '女'}

## 核心性格特征
基于您的八字分析，您的日主为${baziData.dayMaster}，这赋予了您独特的个性魅力。您是一个充满智慧和创造力的人，善于观察和思考，总能在细节中发现别人忽视的价值。您的内心深处有着对完美的追求，这使您在做事时格外认真细致。同时，您具有很强的直觉力和同理心，能够敏锐地感知他人的情绪变化。

## 天赋潜能
您最突出的天赋在于创新思维和沟通能力。您天生具有将复杂概念简单化的能力，善于用独特的视角解决问题。在艺术创作、策略规划或人际交往方面，您都展现出超乎常人的天赋。特别是在需要创意和灵感的领域，您总能迸发出令人惊喜的想法。

## 事业方向
根据您的五行配置，最适合您的职业方向是创意产业和知识服务业。设计、媒体、教育、咨询等需要创造力和沟通能力的行业都很适合您。您也适合担任团队的智囊角色，为组织提供战略性建议。创业也是不错的选择，特别是在文化创意或科技创新领域。

## 感情运势
在感情方面，您追求心灵层面的共鸣。您需要一个能够理解您内心世界、与您进行深度交流的伴侣。您的感情表达方式含蓄而深情，更喜欢用行动而非言语来表达爱意。建议您在选择伴侣时，重视精神契合度，寻找能够共同成长的人生伴侣。

---

**想要了解更多详细内容吗？**

完整报告包含：
- 深度人格分析和成长建议
- 详细职业规划和财富策略  
- 全面感情分析和最佳配对
- 人生使命和关键转折点
- 个性化健康养生方案
- 以及更多专属于您的命理指导...

立即解锁完整报告，开启您的命运探索之旅！`;
}

// 模拟报告生成函数（测试用）
function generateMockReport(birthData: any, baziData: any): string {
  return `# 宇宙命理分析报告

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '12:00'}${birthData.isTimeKnownInput ? ' (用户提供)' : ' (系统默认)'}
- 性别：${birthData.gender === 'male' ? '男' : '女'}
- 时区：${birthData.timeZone}

## 八字信息
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

---

# 一、人格特质分析

## 核心性格特征
基于您的八字分析，您的日主为${baziData.dayMaster}，这赋予了您独特的性格特质。${baziData.dayMaster}日主的人通常具有以下特征：

您是一个充满智慧和创造力的人，善于思考和分析问题。您的性格中蕴含着深邃的洞察力，能够看透事物的本质。在日常生活中，您表现出稳重而不失灵活的特质，既能够坚守原则，又能够适应变化。

您的思维方式独特而敏锐，常常能够提出新颖的见解和创意。这种天赋使您在解决问题时总能找到别人忽视的角度。同时，您也具有很强的直觉力，能够感知到他人的情绪和需求。

## 天赋与优势
1. **创新思维**：您天生具有创新精神，善于打破常规，寻找新的解决方案。
2. **沟通能力**：您的表达能力出色，能够清晰地传达自己的想法和感受。
3. **学习能力**：您对知识有着强烈的渴望，学习新事物的速度快且扎实。
4. **适应能力**：面对变化，您能够快速调整策略，展现出良好的灵活性。
5. **领导潜质**：您具有天生的领导才能，能够激励和带领他人前进。

## 需要改进的方面
虽然您拥有诸多优点，但仍有一些需要注意和改进的地方：

1. **过度思虑**：有时您可能会想得太多，导致决策延迟或错失良机。
2. **情绪管理**：在压力下，您可能会表现出情绪波动，需要学习更好的情绪调节技巧。
3. **完美主义**：对自己和他人要求过高，可能会带来不必要的压力。
4. **时间管理**：您可能会同时关注太多事情，需要学习优先级排序。

## 社交风格
在社交场合中，您展现出独特的魅力。您善于倾听，能够真诚地理解他人的想法和感受。这使您成为朋友圈中受欢迎的人物。您的社交风格既不过于热情，也不过于冷淡，恰到好处地保持着舒适的人际距离。

---

# 二、职业发展指导

## 最适合的职业领域
根据您的五行配置和性格特质，以下职业领域特别适合您：

1. **创意产业**：设计、艺术、广告、媒体等需要创造力的行业
2. **科技领域**：软件开发、数据分析、人工智能、创新科技
3. **教育培训**：教师、培训师、教育顾问、知识传播者
4. **咨询服务**：管理咨询、心理咨询、职业规划师
5. **金融投资**：投资分析、金融规划、风险管理

## 创业潜质评估
您具有较强的创业潜质。您的创新思维和领导能力为创业提供了良好的基础。特别是在以下类型的创业项目中，您更容易获得成功：

- **知识型创业**：在线教育、内容创作、知识付费平台
- **技术型创业**：科技产品开发、软件服务、创新解决方案
- **服务型创业**：咨询服务、个人品牌、专业服务

建议您在创业初期找到互补的合作伙伴，特别是在执行力和细节管理方面能够弥补您的不足的人。

## 财富累积策略
1. **多元化收入**：建立多个收入来源，不要依赖单一收入
2. **长期投资**：注重长期价值投资，避免短期投机
3. **知识变现**：将您的专业知识和技能转化为收入
4. **理性消费**：制定预算计划，避免冲动消费
5. **持续学习**：投资自己的成长，提升专业技能和认知水平

## 职场发展建议
- **短期目标（1-2年）**：专注于技能提升和人脉积累
- **中期目标（3-5年）**：寻求更高的职位或创业机会
- **长期目标（5年以上）**：建立个人品牌和影响力

---

# 三、情感关系分析

## 爱情模式
您在爱情中追求精神层面的共鸣。对您来说，伴侣不仅是生活的伴侣，更是灵魂的知己。您重视深度的情感交流，希望与伴侣分享思想、梦想和人生感悟。

您的爱情表达方式含蓄而深情。您不太擅长甜言蜜语，但会通过实际行动来表达爱意。您需要一个能够理解您内心世界的伴侣，一个能够与您进行深度对话的人。

## 最佳配对类型
根据五行相生相克的原理，最适合您的伴侣类型是：

1. **互补型**：五行中您所缺少的元素，对方能够补充
2. **支持型**：能够理解和支持您的理想和追求的人
3. **成长型**：愿意与您共同成长，共同进步的伴侣

具体来说，性格温和、情绪稳定、有耐心且善解人意的人最适合您。

## 婚姻运势
您的婚姻运势整体良好。您重视家庭和谐，愿意为家庭付出努力。在婚姻中，您需要注意：

1. **沟通方式**：学会更直接地表达情感需求
2. **时间分配**：平衡工作与家庭的时间
3. **共同成长**：与伴侣保持同步成长的节奏
4. **浪漫维持**：不要因为忙碌而忽视浪漫的重要性

## 家庭关系
您在家庭中扮演着重要的角色。您既能够承担责任，又能够给予家人情感支持。建议：

- 多花时间陪伴家人，特别是父母和孩子
- 学会表达对家人的关爱和感激
- 在家庭决策中保持民主和开放的态度
- 创造温馨的家庭氛围和传统

---

# 四、人生使命与成长

## 生命核心使命
您的生命使命是成为一个启发者和引导者。您被赋予了独特的洞察力和智慧，这使您能够帮助他人看清方向，找到人生的意义。无论在什么领域，您都有潜力成为思想的引领者和创新的推动者。

您的存在本身就是一种启发。通过您的言行、作品或成就，您能够激励他人追求更高的目标，实现更大的梦想。

## 人生发展阶段
**青年期（20-35岁）**：探索和积累阶段
- 重点：学习、体验、建立基础
- 建议：广泛尝试，找到真正的兴趣和天赋所在

**中年期（35-50岁）**：发展和成就阶段
- 重点：事业发展、家庭建设、社会贡献
- 建议：专注于核心领域，建立专业影响力

**成熟期（50-65岁）**：传承和升华阶段
- 重点：经验传承、智慧分享、精神追求
- 建议：培养后辈，回馈社会，追求内心平静

**晚年期（65岁以后）**：圆满和超然阶段
- 重点：生命回顾、精神修养、安享晚年
- 建议：保持学习热情，享受生活的美好

## 精神成长路径
1. **自我认知**：深入了解自己的内心世界
2. **情绪成熟**：学会管理和转化情绪能量
3. **智慧提升**：通过学习和体验增长智慧
4. **心灵觉醒**：追求更高层次的精神境界
5. **利他奉献**：用自己的能力服务他人和社会

## 关键人生转折点
- **28-30岁**：事业方向的重要选择期
- **35-37岁**：人生价值观的深化期
- **42-45岁**：中年转型的关键期
- **50-52岁**：人生智慧的成熟期

---

# 五、健康养生指导

## 体质特点
根据您的五行配置，您的体质特点如下：

您属于偏${baziData.elements.wood > baziData.elements.fire ? '木' : '火'}型体质，这意味着您的新陈代谢较为活跃，精力充沛，但也容易出现能量消耗过度的情况。您的免疫系统整体良好，但需要注意季节变化对身体的影响。

## 需要关注的健康领域
1. **神经系统**：由于思虑较多，需要注意神经系统的保养
2. **消化系统**：情绪波动可能影响消化功能
3. **睡眠质量**：确保充足的睡眠，避免熬夜
4. **眼睛保护**：长时间用脑用眼，需要适当休息
5. **脊椎健康**：注意坐姿，定期活动

## 季节性养生
**春季养生**：
- 多进行户外活动，呼吸新鲜空气
- 饮食清淡，多吃绿色蔬菜
- 早睡早起，顺应自然规律

**夏季养生**：
- 避免过度贪凉，保护阳气
- 多喝水，补充流失的水分
- 适当午休，避免中暑

**秋季养生**：
- 润肺养阴，多吃梨、百合等
- 注意保暖，预防感冒
- 调节情绪，避免悲秋

**冬季养生**：
- 注重保暖，特别是腰部和脚部
- 适当进补，增强体质
- 减少户外活动，储存能量

## 运动与饮食
**推荐运动**：
- 瑜伽：有助于身心平衡
- 太极拳：动静结合，养生健体
- 慢跑：增强心肺功能
- 游泳：全身运动，减轻关节压力

**饮食建议**：
- 饮食规律，避免暴饮暴食
- 多吃五谷杂粮，平衡营养
- 适量摄入优质蛋白质
- 减少辛辣刺激食物
- 根据季节调整饮食结构

## 心理健康
1. **冥想练习**：每天10-20分钟的冥想
2. **情绪日记**：记录和反思情绪变化
3. **社交活动**：保持适度的社交互动
4. **兴趣培养**：发展能够放松身心的爱好
5. **专业帮助**：必要时寻求心理咨询

---

# 六、综合建议与总结

## 人生规划建议
基于以上全面的分析，为您提供以下综合建议：

1. **发挥优势**：充分利用您的创新思维和领导才能
2. **补足短板**：改善时间管理和情绪控制能力
3. **持续成长**：保持学习的热情和开放的心态
4. **平衡生活**：在事业、家庭、健康和精神追求之间找到平衡
5. **服务他人**：用您的才能和智慧帮助更多的人

## 近期发展重点
在未来1-2年内，建议您重点关注：

1. **技能提升**：选择1-2项核心技能深入学习
2. **人脉拓展**：建立高质量的职业和社交网络
3. **健康管理**：建立规律的运动和作息习惯
4. **财务规划**：制定合理的储蓄和投资计划
5. **家庭关系**：多花时间陪伴家人，增进感情

## 长期发展目标
3-5年的长期目标建议：

1. **事业目标**：在专业领域建立权威地位
2. **财务目标**：实现财务自由的基础
3. **家庭目标**：创造和谐幸福的家庭环境
4. **个人成长**：完成重要的自我突破和转型
5. **社会贡献**：找到回馈社会的方式

---

## 结语

每个人都是独一无二的存在，您的八字命理只是了解自己的一个角度。真正的命运掌握在您自己手中。希望这份报告能够为您提供有价值的参考和指导，帮助您更好地认识自己，规划未来，实现人生的美好愿景。

记住：命理分析是指南针，而不是地图。您的选择和努力才是决定人生方向的关键。愿您在人生的道路上，勇敢前行，智慧选择，收获幸福与成功！

---

*本报告基于中国传统命理学原理，结合现代心理学和生涯规划理论生成。建议仅供参考，具体决策请结合实际情况。*`;
}

export async function POST(request: NextRequest) {
  const isStaticMode = process.env.DEPLOYMENT_MODE === 'static'
  
  if (isStaticMode) {
    return NextResponse.json({ 
      error: 'API disabled for static deployment',
      message: 'This is a static demo version. All API endpoints are disabled.',
      status: 'demo_mode'
    }, { status: 503 })
  }

  // 动态模式下的正常API逻辑
  try {
    const body = await request.json()
    const { birthData, reportName } = body

    console.log('🚀 [API] Starting report generation with birthData:', birthData)

    // 检查智谱AI API密钥
    if (!process.env.ZHIPU_API_KEY) {
      console.warn('⚠️ [API] ZHIPU_API_KEY not found, falling back to mock reports')
      return generateMockReports(birthData, reportName)
    }

    try {
      // 计算八字数据
      console.log('🔮 [API] Calculating Bazi data...')
      const baziData = await BaziService.calculateBazi(birthData)
      console.log('✅ [API] Bazi data calculated successfully')

      // 使用智谱AI生成报告
      console.log('🤖 [API] Generating AI report with ZhipuAI...')
      const zhipuService = new ZhipuService()
      
      // 生成完整报告
      const fullReport = await zhipuService.generateBaziReport(birthData, baziData)
      console.log('✅ [API] Full AI report generated, length:', fullReport.length)
      
      // 从完整报告中截取预览版（前1500字符）
      const previewReport = extractPreviewFromFullReport(fullReport)
      console.log('✅ [API] Preview report extracted, length:', previewReport.length)
      
      // 生成报告ID
      const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      return NextResponse.json({
        success: true,
        reportId,
        previewReport,
        fullReport,
        message: 'AI报告生成成功',
        source: 'zhipu-ai'
      })

    } catch (aiError) {
      console.error('❌ [API] AI generation failed, falling back to mock reports:', aiError)
      return generateMockReports(birthData, reportName)
    }

  } catch (error) {
    console.error('❌ [API] Error generating report:', error)
    return NextResponse.json({
      error: 'Failed to generate report',
      message: '报告生成失败，请稍后重试',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 生成模拟报告的函数（作为备用方案）
function generateMockReports(birthData: any, reportName: string) {
  console.log('📝 [API] Generating mock reports as fallback...')
  
  // Generate mock reports (no Bazi calculation needed for API)
  const mockBaziData = {
    dayMaster: '甲',
    heavenlyStems: ['甲', '乙', '丙', '丁'],
    earthlyBranches: ['子', '丑', '寅', '卯'],
    elements: { wood: 2, fire: 1, earth: 1, metal: 1, water: 1 }
  }
  const fullReport = generateMockReport(birthData, mockBaziData)
  const previewReport = generateMockPreviewReport(birthData, mockBaziData)
  console.log('📝 [API] Mock reports generated, full length:', fullReport.length, 'preview length:', previewReport.length)
  
  // 生成报告ID
  const reportId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  return NextResponse.json({
    success: true,
    reportId,
    previewReport,
    fullReport,
    message: '模拟报告生成成功',
    source: 'mock'
  })
}
