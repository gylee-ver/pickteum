import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/data'

export const runtime = 'edge'

export async function GET() {
  try {
    const categories = await getCategories()
    
    const response = NextResponse.json({ categories })
    
    // 카테고리는 자주 변하지 않으므로 더 긴 캐시 시간 설정
    response.headers.set(
      'Cache-Control', 
      's-maxage=300, stale-while-revalidate=600'
    )
    
    return response
    
  } catch (error) {
    console.error('카테고리 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}