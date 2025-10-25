import { BirthData, BaziData } from '@/types'
import { toDate } from 'date-fns-tz';

export class BaziService {
  // 生成模拟的八字数据（用于测试）
  static generateMockBaziData(birthData: BirthData): BaziData {
    const mockStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const mockBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // 生成随机但固定的八字（基于出生日期的简单哈希）
    const dateHash = birthData.birthDate.split('-').reduce((acc, part) => acc + parseInt(part), 0);
    
    // 天干对应的五行
    const stemElements: { [key: string]: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER' } = {
      '甲': 'WOOD', '乙': 'WOOD',
      '丙': 'FIRE', '丁': 'FIRE',
      '戊': 'EARTH', '己': 'EARTH',
      '庚': 'METAL', '辛': 'METAL',
      '壬': 'WATER', '癸': 'WATER'
    };
    
    // 天干的阴阳属性
    const stemNature: { [key: string]: 'Yang' | 'Yin' } = {
      '甲': 'Yang', '乙': 'Yin',
      '丙': 'Yang', '丁': 'Yin',
      '戊': 'Yang', '己': 'Yin',
      '庚': 'Yang', '辛': 'Yin',
      '壬': 'Yang', '癸': 'Yin'
    };
    
    const dayMasterStem = mockStems[(dateHash + 2) % 10];
    
    return {
      heavenlyStems: [
        mockStems[dateHash % 10],
        mockStems[(dateHash + 1) % 10],
        mockStems[(dateHash + 2) % 10],
        mockStems[(dateHash + 3) % 10]
      ],
      earthlyBranches: [
        mockBranches[dateHash % 12],
        mockBranches[(dateHash + 1) % 12],
        mockBranches[(dateHash + 2) % 12],
        mockBranches[(dateHash + 3) % 12]
      ],
      hiddenStems: [
        mockStems[(dateHash + 4) % 10],
        mockStems[(dateHash + 5) % 10],
        mockStems[(dateHash + 6) % 10]
      ],
      dayMaster: dayMasterStem,
      dayMasterNature: stemNature[dayMasterStem],
      dayMasterElement: stemElements[dayMasterStem],
      elements: {
        wood: Math.floor(Math.random() * 3) + 1,
        fire: Math.floor(Math.random() * 3) + 1,
        earth: Math.floor(Math.random() * 3) + 1,
        metal: Math.floor(Math.random() * 3) + 1,
        water: Math.floor(Math.random() * 3) + 1
      },
      yearPillar: mockStems[dateHash % 10] + mockBranches[dateHash % 12],
      monthPillar: mockStems[(dateHash + 1) % 10] + mockBranches[(dateHash + 1) % 12],
      dayPillar: mockStems[(dateHash + 2) % 10] + mockBranches[(dateHash + 2) % 12],
      hourPillar: mockStems[(dateHash + 3) % 10] + mockBranches[(dateHash + 3) % 12]
    };
  }

  static async calculateBazi(birthData: BirthData): Promise<BaziData> {
    try {
      // Import the bazi calculator dynamically to avoid SSR issues
      const baziModule = await import('@aharris02/bazi-calculator-by-alvamind')

      const BaziCalculator = baziModule.BaziCalculator;

      let birthDateTimeString;
      if(birthData.isTimeKnownInput){
        // 当用户提供了具体时间时，使用用户输入的时间
        birthDateTimeString = `${birthData.birthDate}T${birthData.birthTime}:00`
      }else{
        // 当用户没有提供时间时，使用默认时间 12:00:00
        birthDateTimeString = `${birthData.birthDate}T12:00:00`
      }

      console.log('🔮 [BaziService] 出生日期时间字符串:', birthDateTimeString)
      console.log('🔮 [BaziService] 是否已知出生时间:', birthData.isTimeKnownInput)
      console.log('🔮 [BaziService] 用户输入的出生时间:', birthData.birthTime)
      console.log('🔮 [BaziService] 时区:', birthData.timeZone)
      console.log('🔮 [BaziService] 性别:', birthData.gender)
      
      // 检查是否强制使用UTC时区
      const forceUTC = process.env.FORCE_UTC_TIMEZONE === 'true'
      console.log('🔮 [BaziService] 强制UTC时区设置:', forceUTC)
      
      // 尝试设置UTC时区环境（可能被系统覆盖）
      if (forceUTC) {
        process.env.TZ = 'UTC'
      }

      const birthDateLocal = toDate(birthDateTimeString, { timeZone: birthData.timeZone })

      // 创建纯UTC时间的Date对象 - 使用最可靠的方法
      // 直接使用ISO字符串创建，确保是UTC时间
      const birthDate = new Date(birthDateLocal.toISOString())
      
      // 验证时区设置和转换结果
      console.log('🔮 [BaziService] 环境时区设置:', process.env.TZ)
      console.log('🔮 [BaziService] 系统时区偏移:', new Date().getTimezoneOffset())
      console.log('🔮 [BaziService] 原始本地时间:', birthDateLocal.toString())
      console.log('🔮 [BaziService] 原始本地时间ISO:', birthDateLocal.toISOString())
      console.log('🔮 [BaziService] 转换后UTC时间:', birthDate.toString())
      
      const calculator = new BaziCalculator(birthDate, birthData.gender, birthData.timeZone, birthData.isTimeKnownInput)

      console.log("🔮 [BaziService] calculator.toString():",calculator.toString())
      
      // Calculate comprehensive bazi analysis
      const analysis = calculator.getCompleteAnalysis();
      
      // 打印天干地支8个字
      if (analysis?.mainPillars) {
        const yearPillar = analysis.mainPillars.year;
        const monthPillar = analysis.mainPillars.month;
        const dayPillar = analysis.mainPillars.day;
        const hourPillar = analysis.mainPillars.time;
        
        console.log("🔮 [BaziService] 天干地支8个字:");
        console.log(`年柱: ${yearPillar?.chinese || 'N/A'}`);
        console.log(`月柱: ${monthPillar?.chinese || 'N/A'}`);
        console.log(`日柱: ${dayPillar?.chinese || 'N/A'}`);
        console.log(`时柱: ${hourPillar?.chinese || 'N/A'}`);
        
        // 从chinese字段提取8个字符（每个柱包含天干地支2个字符）
        const eightCharacters = [
          yearPillar?.chinese,
          monthPillar?.chinese,
          dayPillar?.chinese,
          hourPillar?.chinese
        ].filter(Boolean).join('');
        
        console.log(`🔮 [BaziService] 八字8个字: ${eightCharacters}`);
        
        // 如果需要单独的天干地支字符，可以从detailedPillars获取
        if (analysis.detailedPillars) {
          console.log("🔮 [BaziService] 详细天干地支信息:");
          console.log(`年干: ${analysis.detailedPillars.year?.heavenlyStem?.character || ''}`);
          console.log(`年支: ${analysis.detailedPillars.year?.earthlyBranch?.character || ''}`);
          console.log(`月干: ${analysis.detailedPillars.month?.heavenlyStem?.character || ''}`);
          console.log(`月支: ${analysis.detailedPillars.month?.earthlyBranch?.character || ''}`);
          console.log(`日干: ${analysis.detailedPillars.day?.heavenlyStem?.character || ''}`);
          console.log(`日支: ${analysis.detailedPillars.day?.earthlyBranch?.character || ''}`);
          console.log(`时干: ${analysis.detailedPillars.hour?.heavenlyStem?.character || ''}`);
          console.log(`时支: ${analysis.detailedPillars.hour?.earthlyBranch?.character || ''}`);
        }
      }
      const luckPillars = calculator.calculateLuckPillars();
      const interactions = calculator.calculateInteractions();
      
      if (!analysis) {
        throw new Error('Failed to calculate Bazi analysis')
      }

      // Map the analysis to our enhanced BaziData interface
      const pillars = [
        analysis.mainPillars.year,
        analysis.mainPillars.month,
        analysis.mainPillars.day,
        analysis.mainPillars.time
      ].filter(Boolean) // Remove null values
      
      const baziData: BaziData = {
        // 基础四柱信息
        heavenlyStems: pillars.map((p: any) => p.heavenlyStem?.character || ''),
        earthlyBranches: pillars.map((p: any) => p.earthlyBranch?.character || ''),
        hiddenStems: pillars.map((p: any) => p.hiddenStems?.map((hs: any) => hs.character) || []).flat(),
        yearPillar: analysis.mainPillars.year?.chinese || '',
        monthPillar: analysis.mainPillars.month?.chinese || '',
        dayPillar: analysis.mainPillars.day?.chinese || '',
        hourPillar: analysis.mainPillars.time?.chinese || '',
        
        // 日主信息
        dayMaster: analysis.basicAnalysis?.dayMaster?.stem || '',
        dayMasterNature: analysis.basicAnalysis?.dayMaster?.nature || 'Yang',
        dayMasterElement: analysis.basicAnalysis?.dayMaster?.element || 'WOOD',
        
        // 五行分析
        elements: {
          wood: analysis.basicAnalysis?.fiveFactors?.WOOD || 0,
          fire: analysis.basicAnalysis?.fiveFactors?.FIRE || 0,
          earth: analysis.basicAnalysis?.fiveFactors?.EARTH || 0,
          metal: analysis.basicAnalysis?.fiveFactors?.METAL || 0,
          water: analysis.basicAnalysis?.fiveFactors?.WATER || 0
        },
        
        // 日主强弱分析
        dayMasterStrength: analysis.basicAnalysis?.dayMasterStrength ? {
          strength: analysis.basicAnalysis.dayMasterStrength.strength,
          score: analysis.basicAnalysis.dayMasterStrength.score,
          notes: analysis.basicAnalysis.dayMasterStrength.notes
        } : undefined,
        
        // 有利元素分析
        favorableElements: analysis.basicAnalysis?.favorableElements ? {
          primary: analysis.basicAnalysis.favorableElements.primary,
          secondary: analysis.basicAnalysis.favorableElements.secondary,
          unfavorable: analysis.basicAnalysis.favorableElements.unfavorable,
          notes: analysis.basicAnalysis.favorableElements.notes
        } : undefined,
        
        // 八宅分析
        eightMansions: analysis.basicAnalysis?.eightMansions ? {
          group: analysis.basicAnalysis.eightMansions.group,
          lucky: {
            wealth: analysis.basicAnalysis.eightMansions.lucky.wealth,
            health: analysis.basicAnalysis.eightMansions.lucky.health,
            romance: analysis.basicAnalysis.eightMansions.lucky.romance,
            career: analysis.basicAnalysis.eightMansions.lucky.career
          },
          unlucky: {
            obstacles: analysis.basicAnalysis.eightMansions.unlucky.obstacles,
            quarrels: analysis.basicAnalysis.eightMansions.unlucky.quarrels,
            setbacks: analysis.basicAnalysis.eightMansions.unlucky.setbacks,
            totalLoss: analysis.basicAnalysis.eightMansions.unlucky.totalLoss
          }
        } : undefined,
        
        // 基本分析
        lifeGua: analysis.basicAnalysis?.lifeGua,
        nobleman: analysis.basicAnalysis?.nobleman,
        intelligence: analysis.basicAnalysis?.intelligence,
        skyHorse: analysis.basicAnalysis?.skyHorse,
        peachBlossom: analysis.basicAnalysis?.peachBlossom,
        
        // 大运信息
        luckPillars: luckPillars ? {
          pillars: luckPillars.pillars.map(p => ({
            number: p.number,
            heavenlyStem: p.heavenlyStem.character,
            earthlyBranch: p.earthlyBranch.character,
            yearStart: p.yearStart,
            yearEnd: p.yearEnd,
            ageStart: p.ageStart
          })),
          incrementRule: luckPillars.incrementRule,
          isTimingKnown: luckPillars.isTimingKnown
        } : undefined,
        
        // 相互作用分析
        interactions: interactions?.map(i => ({
          type: i.type,
          participants: i.participants.map(p => ({
            pillar: p.pillar,
            source: p.source,
            elementChar: p.elementChar,
            elementType: p.elementType
          })),
          description: i.description,
          involvesFavorableElement: i.involvesFavorableElement,
          involvesUnfavorableElement: i.involvesUnfavorableElement
        }))
      }

      return baziData
    } catch (error) {
      console.error('Error calculating Bazi:', error)
      console.warn('⚠️ [BaziService] 使用模拟数据进行测试')
      
      // 如果计算失败（比如缺少依赖包），返回模拟数据
      return this.generateMockBaziData(birthData)
    }
  }

  static getElementAnalysis(elements: BaziData['elements']): string {
    const total = Object.values(elements).reduce((sum, val) => sum + val, 0)
    if (total === 0) return 'Balanced elements'

    const percentages = {
      wood: Math.round((elements.wood / total) * 100),
      fire: Math.round((elements.fire / total) * 100),
      earth: Math.round((elements.earth / total) * 100),
      metal: Math.round((elements.metal / total) * 100),
      water: Math.round((elements.water / total) * 100)
    }

    // Find dominant element
    const dominant = Object.entries(percentages).reduce((a, b) =>
      percentages[a[0] as keyof typeof percentages] > percentages[b[0] as keyof typeof percentages] ? a : b
    )[0]

    const elementNames = {
      wood: 'Wood (木)',
      fire: 'Fire (火)',
      earth: 'Earth (土)',
      metal: 'Metal (金)',
      water: 'Water (水)'
    }

    return `Dominant Element: ${elementNames[dominant as keyof typeof elementNames]} (${percentages[dominant as keyof typeof percentages]}%)`
  }

  static getDayMasterCharacteristics(dayMaster: string): string {
    const characteristics: { [key: string]: string } = {
      '甲': 'Natural leader, ambitious, and straightforward. You have strong wood element energy.',
      '乙': 'Gentle, adaptable, and cooperative. You possess flexible wood energy.',
      '丙': 'Energetic, enthusiastic, and outgoing. You radiate fire energy.',
      '丁': 'Warm, thoughtful, and detail-oriented. You have gentle fire energy.',
      '戊': 'Reliable, stable, and practical. You embody earth element energy.',
      '己': 'Nurturing, supportive, and humble. You have receptive earth energy.',
      '庚': 'Determined, disciplined, and righteous. You possess strong metal energy.',
      '辛': 'Elegant, precise, and detail-oriented. You have refined metal energy.',
      '壬': 'Resourceful, adaptable, and intelligent. You flow with water energy.',
      '癸': 'Intuitive, gentle, and compassionate. You have deep water energy.'
    }

    return characteristics[dayMaster] || 'Unique individual with special cosmic energy.'
  }
}