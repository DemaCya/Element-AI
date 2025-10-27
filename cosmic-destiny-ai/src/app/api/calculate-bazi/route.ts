import { NextResponse } from 'next/server'
import { BaziService } from '@/services/baziService'
import { BirthData } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // The user-provided birth data from the client
    const birthData: BirthData = {
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      timeZone: body.timeZone,
      gender: body.gender,
      isTimeKnownInput: body.isTimeKnownInput
    };

    if (!birthData.birthDate || !birthData.timeZone || !birthData.gender) {
      return NextResponse.json({ error: 'Missing required birth information' }, { status: 400 })
    }

    // This code now runs on the server, ensuring a consistent UTC environment on Vercel.
    const baziData = await BaziService.calculateBazi(birthData)

    return NextResponse.json(baziData)
  } catch (error) {
    console.error('API Error in calculate-bazi:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: 'Failed to calculate Bazi data', details: errorMessage }, { status: 500 })
  }
}
