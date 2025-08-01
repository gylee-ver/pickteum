import { NextRequest, NextResponse } from 'next/server'
import { getPopularArticles } from '@/lib/data'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')
    
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' }, 
        { status: 400 }
      )
    }

    const articles = await getPopularArticles(limit)
    
    const response = NextResponse.json({ articles })
    
    // 인기 아티클은 중간 정도의 캐시 시간 설정
    response.headers.set(
      'Cache-Control', 
      's-maxage=180, stale-while-revalidate=360'
    )
    
    return response
    
  } catch (error) {
    console.error('인기 아티클 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}