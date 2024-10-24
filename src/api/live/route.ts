import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.openf1.org/v1/session/current')
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch live data ' }, { status: 500 })
  }
}