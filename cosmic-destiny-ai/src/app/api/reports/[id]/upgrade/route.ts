import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  return [
    { id: 'demo-1' },
    { id: 'demo-2' }
  ]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ 
    error: 'API disabled for static deployment',
    message: 'This is a static demo version. All API endpoints are disabled.',
    status: 'demo_mode'
  }, { status: 503 })
}
