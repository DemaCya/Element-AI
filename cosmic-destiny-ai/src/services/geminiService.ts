import { BirthData, BaziData } from '@/types'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class GeminiService {
  private static genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
  private static model = GeminiService.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  private static async generateContent(prompt: string): Promise<string> {
    try {
      const result = await GeminiService.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error('Failed to generate content with Gemini API')
    }
  }
  static async analyzePersonality(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的中国命理学家和心理学家，请基于以下信息进行深度的人格分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}
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
    const prompt = `作为一位专业的职业规划师和命理学家，请基于以下信息进行职业发展分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}
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
    const prompt = `作为一位专业的情感咨询师和命理学家，请基于以下信息进行情感关系分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}
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
5. 婚姻运势和长期关系建议
6. 家庭关系处理方式
7. 友谊和社交模式
8. 实用的恋爱和关系建议

请用中文回答，语言要温暖且实用，提供具体的关系指导。`

    return await this.generateContent(prompt)
  }

  static async analyzeLifePath(birthData: BirthData, baziData: BaziData): Promise<string> {
    const prompt = `作为一位专业的灵性导师和命理学家，请基于以下信息进行人生使命分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}
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
    const prompt = `作为一位专业的中医养生专家和命理学家，请基于以下信息进行健康分析：

出生信息：
- 出生日期：${birthData.birthDate}
- 出生时间：${birthData.birthTime || '未提供'}
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
}