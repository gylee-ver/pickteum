import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24시간 캐시
    },
  })
} 