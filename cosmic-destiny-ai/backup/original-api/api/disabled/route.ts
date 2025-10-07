import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'API disabled for static deployment',
    message: 'This is a static demo version. All API endpoints are disabled.',
    status: 'demo_mode'
  }, { status: 503 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'API disabled for static deployment',
    message: 'This is a static demo version. All API endpoints are disabled.',
    status: 'demo_mode'
  }, { status: 503 })
}
