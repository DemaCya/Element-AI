import { BirthData, BaziData } from '@/types'
import { GoogleGenAI } from '@google/genai'

export class GeminiService {
  private static genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! })

  private static async generateContent(prompt: string): Promise<string> {
    try {
      const response = await GeminiService.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      })
      return response.text || 'No content generated'
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate content with Gemini API')
    }
  }

  // 生成预览报告（免费版本，500-800字）
  static async generatePreviewReport(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位资深的人生规划顾问，请基于以下信息生成一份简短的个人分析预览报告（500-800字）：

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}${birthData.isTimeKnownInput ? ' (用户提供)' : ' (系统默认12:00)'}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

## 八字信息
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份预览报告，包含：

# 您的个人分析概览

## 核心性格特征
简要描述其最突出的2-3个性格特点（150字左右）

## 天赋潜能
指出其最主要的天赋和优势（150字左右）

## 事业方向
简述最适合的1-2个职业方向（150字左右）

## 情感洞察
简要分析其感情特点和建议（150字左右）

---

**想要了解更多详细内容吗？**
完整报告包含：
- 深度人格分析和成长建议
- 详细职业规划和财富策略
- 全面感情分析和最佳配对
- 人生使命和关键转折点
- 个性化健康养生方案
- 以及更多专属于您的个人指导...

立即解锁完整报告，开启您的自我探索之旅！

请用温暖、吸引人的语言撰写，让读者感受到自我探索的魅力，并产生了解更多的兴趣。`

    return await this.generateContent(prompt)
  }
  static async analyzePersonality(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的个人成长顾问和心理学家，请基于以下信息进行深度的人格分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

八字信息：
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份详细的人格分析报告，包括：
1. 核心人格特质和性格特征
2. 主要优势和天赋
3. 需要改进的方面和挑战
4. 社交风格和人际关系模式
5. 情感表达方式
6. 学习和发展建议
7. 领导风格和团队角色

请用中文回答，语言要专业但易懂，结构清晰，内容要有深度和实用性。`

    return await this.generateContent(prompt)
  }

  static async analyzeCareer(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的职业规划师和个人成长顾问，请基于以下信息进行职业发展分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

八字信息：
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份详细的职业发展分析报告，包括：
1. 最适合的职业领域和行业推荐
2. 创业潜质评估和创业建议
3. 财富累积策略和理财建议
4. 理想的职场环境和工作方式
5. 职业发展的关键时机和阶段
6. 收入提升的具体建议
7. 职场人际关系处理建议

请用中文回答，语言要专业但易懂，提供具体可操作的建议。`

    return await this.generateContent(prompt)
  }

  static async analyzeRelationships(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的情感咨询师和个人成长顾问，请基于以下信息进行情感关系分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

八字信息：
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份详细的情感关系分析报告，包括：
1. 爱情模式和情感偏好
2. 最佳配对类型和兼容性分析
3. 沟通风格和表达方式
4. 情感需求核心和期望
5. 长期关系分析与建议
6. 家庭关系处理方式
7. 友谊和社交模式
8. 实用的恋爱和关系建议

请用中文回答，语言要温暖且实用，提供具体的关系指导。`

    return await this.generateContent(prompt)
  }

  static async analyzeLifePath(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的人生规划顾问和灵性导师，请基于以下信息进行人生使命分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

八字信息：
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份详细的人生使命分析报告，包括：
1. 生命核心使命和灵魂任务
2. 主要人生功课和学习主题
3. 人生发展阶段和关键转折点
4. 精神成长路径和内在修炼
5. 需要突破的挑战和转化方向
6. 隐藏的天赋和潜能发掘
7. 人生传承和贡献领域
8. 实用的灵魂成长建议

请用中文回答，语言要富有灵性和启发性，提供深度的人生指导。`

    return await this.generateContent(prompt)
  }

  static async analyzeHealth(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的中医养生专家和健康顾问，请基于以下信息进行健康分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

八字信息：
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份详细的健康养生分析报告，包括：
1. 体质特点和先天优势
2. 需要关注的健康领域
3. 季节性养生建议（春夏秋冬）
4. 适合的运动方式和强度
5. 饮食指导和营养建议
6. 压力管理和放松技巧
7. 心理健康维护方法
8. 定期健康检查建议
9. 日常养生小贴士
10. 中医养生和调理建议

请用中文回答，结合传统中医理论和现代健康理念，提供实用的养生指导。`

    return await this.generateContent(prompt)
  }

  static async generateComprehensiveReport(birthData: BirthData, baziData: BaziData): Promise<{
    personality: string
    career: string
    relationships: string
    lifePath: string
    health: string
  }> {
    try {
      // Generate all analyses in parallel for better performance
      const [personality, career, relationships, lifePath, health] = await Promise.all([
        this.analyzePersonality(birthData, baziData),
        this.analyzeCareer(birthData, baziData),
        this.analyzeRelationships(birthData, baziData),
        this.analyzeLifePath(birthData, baziData),
        this.analyzeHealth(birthData, baziData)
      ])

      return {
        personality,
        career,
        relationships,
        lifePath,
        health
      }
    } catch (error) {
      console.error('Error generating comprehensive report:', error)
      throw new Error('Failed to generate report')
    }
  }

  // 新增：单次API调用生成完整报告
  static async generateSingleComprehensiveReport(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位资深的人生规划顾问、心理学家、职业规划师、情感咨询师、灵性导师和健康顾问，请基于以下信息生成一份全面详细的个人成长分析报告：

## 出生信息
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}${birthData.isTimeKnownInput ? ' (用户提供)' : ' (系统默认12:00)'}
- 性别：${birthData.gender}
- 时区：${birthData.timeZone}

## 八字信息
- 天干：${baziData.heavenlyStems.join('、')}
- 地支：${baziData.earthlyBranches.join('、')}
- 日主：${baziData.dayMaster}
- 五行分布：木${baziData.elements.wood}、火${baziData.elements.fire}、土${baziData.elements.earth}、金${baziData.elements.metal}、水${baziData.elements.water}

请生成一份超过3000字的详细个人成长分析报告，包含以下所有部分：

# 一、人格特质分析
## 核心性格特征
详细分析其性格特点、行为模式、思维方式和情感表达方式。

## 天赋与优势
分析其与生俱来的天赋、才能和优势领域。

## 需要改进的方面
指出性格中需要调整和完善的地方。

## 社交风格
分析其人际关系处理方式和社交偏好。

# 二、职业发展指导
## 最适合的职业领域
基于八字分析推荐最适合的行业和职业方向。

## 创业潜质评估
分析其创业能力和适合的创业方向。

## 财富累积策略
提供具体的理财建议和财富增长方法。

## 职场发展建议
给出职业发展的具体步骤和时机。

# 三、情感关系分析
## 爱情模式
分析其恋爱方式和情感表达特点。

## 最佳配对类型
基于五行相生相克分析最适合的伴侣类型。

## 长期关系分析
分析婚姻状况和长期关系建议。

## 家庭关系
提供家庭关系处理的指导建议。

# 四、人生使命与成长
## 生命核心使命
分析其人生目标和灵魂任务。

## 人生发展阶段
详细描述不同年龄段的发展重点。

## 精神成长路径
提供内在修炼和心灵成长的建议。

## 关键人生转折点
指出人生中的重要时机和转折点。

# 五、健康养生指导
## 体质特点
分析其先天体质和健康优势。

## 需要关注的健康领域
指出需要特别注意的身体部位和健康问题。

## 季节性养生
提供春夏秋冬四季的养生建议。

## 运动与饮食
推荐适合的运动方式和饮食调理。

## 心理健康
提供压力管理和情绪调节的方法。

# 六、综合建议与总结
## 人生规划建议
基于以上分析给出综合的人生规划建议。

## 近期发展重点
指出当前阶段需要重点关注的事项。

## 长期发展目标
设定3-5年的长期发展目标。

请用专业但易懂的中文撰写，语言要温暖且有启发性，内容要具体可操作，避免空洞的套话。每个部分都要有深度分析，提供实用的指导建议。`

    return await this.generateContent(prompt)
  }
}