// 测试八字计算
const { BaziService } = require('./src/services/baziService.ts')

async function testBaziCalculation() {
  console.log('🧪 开始测试八字计算...')
  
  const testBirthData = {
    birthDate: '1990-05-15',
    birthTime: '14:30',
    timeZone: 'Asia/Shanghai',
    gender: 'male',
    isTimeKnownInput: true
  }
  
  console.log('📅 测试出生信息:', testBirthData)
  
  try {
    const baziData = await BaziService.calculateBazi(testBirthData)
    
    console.log('\n🔮 八字计算结果:')
    console.log('📊 天干 (Heavenly Stems):', baziData.heavenlyStems)
    console.log('📊 地支 (Earthly Branches):', baziData.earthlyBranches)
    console.log('👑 日主 (Day Master):', baziData.dayMaster)
    console.log('⚖️ 五行分布 (Elements):', baziData.elements)
    console.log('🏛️ 年柱 (Year Pillar):', baziData.yearPillar)
    console.log('🏛️ 月柱 (Month Pillar):', baziData.monthPillar)
    console.log('🏛️ 日柱 (Day Pillar):', baziData.dayPillar)
    console.log('🏛️ 时柱 (Hour Pillar):', baziData.hourPillar)
    
    if (baziData.dayMasterStrength) {
      console.log('💪 日主强弱:', baziData.dayMasterStrength)
    }
    
    if (baziData.favorableElements) {
      console.log('🌟 有利元素:', baziData.favorableElements)
    }
    
    console.log('\n✅ 八字计算测试完成!')
    
  } catch (error) {
    console.error('❌ 八字计算测试失败:', error)
  }
}

// 运行测试
testBaziCalculation()
