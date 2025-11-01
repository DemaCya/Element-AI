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
      // 🌍 Log server timezone information before Bazi calculation
      console.log('🌍 [BaziService] ===== Starting Bazi Calculation =====');
      console.log(`🌍 [BaziService] Current server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      console.log(`🌍 [BaziService] Current environment TZ: ${process.env.TZ || 'Not set'}`);
      console.log(`🌍 [BaziService] Current system time: ${new Date().toString()}`);
      console.log(`🌍 [BaziService] Current UTC time: ${new Date().toISOString()}`);
      
      // Force the Node.js process to use UTC. This is the most critical step.
      process.env.TZ = 'UTC'

      // Log the server's timezone for debugging AFTER attempting to set it.
      const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(`🌍 [BaziService] Server runtime timezone is now: ${serverTimeZone}`);

      // Import the bazi calculator dynamically to avoid SSR issues
      const baziModule = await import('@aharris02/bazi-calculator-by-alvamind')

      const BaziCalculator = baziModule.BaziCalculator;

      let birthDateTimeString;
      if(birthData.isTimeKnownInput){
        // When the user provides a specific time, use the user's input time
        birthDateTimeString = `${birthData.birthDate}T${birthData.birthTime}:00`
      }else{
        // When the user does not provide a time, use the default time 12:00:00
        birthDateTimeString = `${birthData.birthDate}T12:00:00`
      }

      console.log('🔮 [BaziService] Birth date and time string:', birthDateTimeString)
      console.log('🔮 [BaziService] Is birth time known:', birthData.isTimeKnownInput)
      console.log('🔮 [BaziService] User input birth time:', birthData.birthTime)
      console.log('🔮 [BaziService] Time zone:', birthData.timeZone)
      console.log('🔮 [BaziService] Gender:', birthData.gender)
      
      const birthDateLocal = toDate(birthDateTimeString, { timeZone: birthData.timeZone })
      
      // Verify timezone settings and conversion results
      console.log('🔮 [BaziService] Environment timezone setting:', process.env.TZ)
      console.log('🔮 [BaziService] System timezone offset:', new Date().getTimezoneOffset())
      console.log('🔮 [BaziService] Original local time:', birthDateLocal.toString())
      console.log('🔮 [BaziService] Original local time ISO:', birthDateLocal.toISOString())
      
      const calculator = new BaziCalculator(birthDateLocal, birthData.gender, birthData.timeZone, birthData.isTimeKnownInput)

      console.log("🔮 [BaziService] calculator.toString():",calculator.toString())
      
      // Calculate comprehensive bazi analysis
      const analysis = calculator.getCompleteAnalysis();
      
      // Print complete Bazi analysis details
      console.log('🔮 [BaziService] ===== Complete Bazi Analysis Details =====');
      
      // 打印四柱信息
      if (analysis?.mainPillars) {
        console.log('🔮 [BaziService] mainPillars:');
        console.log('  - year:', analysis.mainPillars.year);
        console.log('  - month:', analysis.mainPillars.month);
        console.log('  - day:', analysis.mainPillars.day);
        console.log('  - time:', analysis.mainPillars.time);
      }
      
      // 打印详细柱信息
      if (analysis?.detailedPillars) {
        console.log('🔮 [BaziService] detailedPillars:');
        console.log('  - year:', analysis.detailedPillars.year);
        console.log('  - month:', analysis.detailedPillars.month);
        console.log('  - day:', analysis.detailedPillars.day);
        console.log('  - hour:', analysis.detailedPillars.hour);
      }
      
      // 打印基础分析
      if (analysis?.basicAnalysis) {
        console.log('🔮 [BaziService] basicAnalysis:');
        console.log('  - dayMaster:', analysis.basicAnalysis.dayMaster);
        console.log('  - dayMasterStrength:', analysis.basicAnalysis.dayMasterStrength);
        console.log('  - fiveFactors:', analysis.basicAnalysis.fiveFactors);
        console.log('  - favorableElements:', analysis.basicAnalysis.favorableElements);
        console.log('  - eightMansions:', analysis.basicAnalysis.eightMansions);
        console.log('  - lifeGua:', analysis.basicAnalysis.lifeGua);
        console.log('  - nobleman:', analysis.basicAnalysis.nobleman);
        console.log('  - intelligence:', analysis.basicAnalysis.intelligence);
        console.log('  - skyHorse:', analysis.basicAnalysis.skyHorse);
        console.log('  - peachBlossom:', analysis.basicAnalysis.peachBlossom);
      }
      
      console.log('🔮 [BaziService] ===== End of Bazi Analysis Details =====');
      
      // 打印天干地支8个字
      if (analysis?.mainPillars) {
        const yearPillar = analysis.mainPillars.year;
        const monthPillar = analysis.mainPillars.month;
        const dayPillar = analysis.mainPillars.day;
        const hourPillar = analysis.mainPillars.time;
        
        console.log("🔮 [BaziService] 8 Characters of Heavenly Stems and Earthly Branches:");
        console.log(`Year Pillar: ${yearPillar?.chinese || 'N/A'}`);
        console.log(`Month Pillar: ${monthPillar?.chinese || 'N/A'}`);
        console.log(`Day Pillar: ${dayPillar?.chinese || 'N/A'}`);
        console.log(`Hour Pillar: ${hourPillar?.chinese || 'N/A'}`);
        
        // Extract 8 characters from the chinese field (each pillar contains 2 characters for stem and branch)
        const eightCharacters = [
          yearPillar?.chinese,
          monthPillar?.chinese,
          dayPillar?.chinese,
          hourPillar?.chinese
        ].filter(Boolean).join('');
        
        console.log(`🔮 [BaziService] Bazi 8 characters: ${eightCharacters}`);
        
        // If individual stem and branch characters are needed, they can be obtained from detailedPillars
        if (analysis.detailedPillars) {
          console.log("🔮 [BaziService] Detailed Heavenly Stems and Earthly Branches Information:");
          console.log(`Year Stem: ${analysis.detailedPillars.year?.heavenlyStem?.character || ''}`);
          console.log(`Year Branch: ${analysis.detailedPillars.year?.earthlyBranch?.character || ''}`);
          console.log(`Month Stem: ${analysis.detailedPillars.month?.heavenlyStem?.character || ''}`);
          console.log(`Month Branch: ${analysis.detailedPillars.month?.earthlyBranch?.character || ''}`);
          console.log(`Day Stem: ${analysis.detailedPillars.day?.heavenlyStem?.character || ''}`);
          console.log(`Day Branch: ${analysis.detailedPillars.day?.earthlyBranch?.character || ''}`);
          console.log(`Hour Stem: ${analysis.detailedPillars.hour?.heavenlyStem?.character || ''}`);
          console.log(`Hour Branch: ${analysis.detailedPillars.hour?.earthlyBranch?.character || ''}`);
        }
      }
      const luckPillars = calculator.calculateLuckPillars();
      const interactions = calculator.calculateInteractions();
      
      // Use the library's method to get the current luck pillar (more accurate)
      let currentPillar = null;
      try {
        const currentDate = new Date();
        const currentPillarFromLib = calculator.getCurrentLuckPillar(currentDate);
        
        if (currentPillarFromLib) {
          // Calculate precise age (considering month and day)
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth();
          const currentDay = currentDate.getDate();
          const birthYear = birthDateLocal.getFullYear();
          const birthMonth = birthDateLocal.getMonth();
          const birthDay = birthDateLocal.getDate();
          
          let age = currentYear - birthYear;
          if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
            age--;
          }
          
          // Convert the data returned by the library to our format
          currentPillar = {
            number: currentPillarFromLib.number,
            heavenlyStem: currentPillarFromLib.heavenlyStem.character,
            earthlyBranch: currentPillarFromLib.earthlyBranch.character,
            yearStart: currentPillarFromLib.yearStart,
            yearEnd: currentPillarFromLib.yearEnd,
            ageStart: currentPillarFromLib.ageStart,
            currentAge: age
          };
          
          console.log('✅ [BaziService] Successfully retrieved current luck pillar using library method:', currentPillarFromLib.number);
        } else {
          console.warn('⚠️ [BaziService] Library method returned null, will use fallback method for calculation');
        }
      } catch (error) {
        console.warn('⚠️ [BaziService] Failed to get current luck pillar using library method:', error);
      }
      
      // Fallback method: if the library method fails, use our own calculation method
      if (!currentPillar && luckPillars && luckPillars.pillars.length > 0) {
        const currentYear = new Date().getFullYear();
        const currentDate = new Date();
        const birthYear = birthDateLocal.getFullYear();
        const birthMonth = birthDateLocal.getMonth();
        const birthDay = birthDateLocal.getDate();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        
        // Calculate precise age (considering month and day)
        let age = currentYear - birthYear;
        if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
          age--;
        }
        
        // Find the luck pillar for the current year
        for (const pillar of luckPillars.pillars) {
          if (pillar.yearStart !== null && pillar.yearEnd !== null) {
            if (currentYear >= pillar.yearStart && currentYear <= pillar.yearEnd) {
              currentPillar = {
                number: pillar.number,
                heavenlyStem: pillar.heavenlyStem.character,
                earthlyBranch: pillar.earthlyBranch.character,
                yearStart: pillar.yearStart,
                yearEnd: pillar.yearEnd,
                ageStart: pillar.ageStart,
                currentAge: age
              };
              console.log('✅ [BaziService] Calculated current luck pillar using fallback method');
              break;
            }
          }
        }
        
        // If the current luck pillar is not found, check if it's before the start or after the end
        if (!currentPillar && luckPillars.pillars.length > 0) {
          const firstPillar = luckPillars.pillars[0];
          const lastPillar = luckPillars.pillars[luckPillars.pillars.length - 1];
          
          if (firstPillar.yearStart !== null && currentYear < firstPillar.yearStart) {
            // Not yet started, return the first luck pillar (upcoming)
            currentPillar = {
              number: firstPillar.number,
              heavenlyStem: firstPillar.heavenlyStem.character,
              earthlyBranch: firstPillar.earthlyBranch.character,
              yearStart: firstPillar.yearStart,
              yearEnd: firstPillar.yearEnd,
              ageStart: firstPillar.ageStart,
              currentAge: age
            };
          } else if (lastPillar.yearEnd !== null && currentYear > lastPillar.yearEnd) {
            // Has exceeded the last luck pillar, return the last one
            currentPillar = {
              number: lastPillar.number,
              heavenlyStem: lastPillar.heavenlyStem.character,
              earthlyBranch: lastPillar.earthlyBranch.character,
              yearStart: lastPillar.yearStart,
              yearEnd: lastPillar.yearEnd,
              ageStart: lastPillar.ageStart,
              currentAge: age
            };
          }
        }
      }
      
      // Print luck pillar information
      console.log('🔮 [BaziService] ===== Luck Pillar Information Details =====');
      if (luckPillars) {
        console.log('🔮 [BaziService] luckPillars:');
        console.log('  - incrementRule:', luckPillars.incrementRule);
        console.log('  - isTimingKnown:', luckPillars.isTimingKnown);
        console.log('  - startAgeYears:', luckPillars.startAgeYears);
        console.log('  - startAgeMonths:', luckPillars.startAgeMonths);
        console.log('  - startAgeDays:', luckPillars.startAgeDays);
        console.log('  - pillars count:', luckPillars.pillars.length);
        
        if (currentPillar) {
          const year = new Date().getFullYear();
          const isBeforeStart = currentPillar.yearStart !== null && year < currentPillar.yearStart;
          const isAfterEnd = currentPillar.yearEnd !== null && year > currentPillar.yearEnd;
          let status = '';
          if (isBeforeStart) {
            status = ' (Upcoming)';
          } else if (isAfterEnd) {
            status = ' (Ended)';
          } else {
            status = ' (Ongoing)';
          }
          
          console.log('  - Current Luck Pillar:');
          console.log(`    Luck Pillar ${currentPillar.number}: ${currentPillar.heavenlyStem}${currentPillar.earthlyBranch} ${status}`);
          console.log(`    Year Range: ${currentPillar.yearStart}-${currentPillar.yearEnd}`);
          console.log(`    Current Age: ${currentPillar.currentAge}`);
          console.log(`    Starting Age: ${currentPillar.ageStart}`);
        } else {
          console.log('  - Current Luck Pillar: Not found');
        }
        
        // Print details of all luck pillars
        console.log('  - All Luck Pillars:');
        luckPillars.pillars.forEach((pillar, index) => {
          const isCurrent = currentPillar && pillar.number === currentPillar.number;
          const marker = isCurrent ? ' ⭐ Current' : '';
          console.log(`  ${index + 1}. Luck Pillar ${pillar.number}${marker}:`);
          console.log(`    Heavenly Stem: ${pillar.heavenlyStem.character}`);
          console.log(`    Earthly Branch: ${pillar.earthlyBranch.character}`);
          console.log(`    Year: ${pillar.yearStart}-${pillar.yearEnd}`);
          console.log(`    Starting Age: ${pillar.ageStart}`);
        });
      }
      console.log('🔮 [BaziService] ===== End of Luck Pillar Information Details =====');
      
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
          isTimingKnown: luckPillars.isTimingKnown,
          currentPillar: currentPillar || undefined
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
      console.warn('⚠️ [BaziService] Using mock data for testing')
      
      // If calculation fails (e.g., missing dependency), return mock data
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
      wood: 'Wood',
      fire: 'Fire',
      earth: 'Earth',
      metal: 'Metal',
      water: 'Water'
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