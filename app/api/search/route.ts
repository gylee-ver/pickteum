import { NextRequest, NextResponse } from 'next/server'
import { searchArticles } from '@/lib/data'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    // 쿼리 유효성 검사
    if (!query.trim()) {
      return NextResponse.json({ articles: [] })
    }

    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' }, 
        { status: 400 }
      )
    }

    const articles = await searchArticles(query, limit)
    
    const response = NextResponse.json({ articles, query })
    
    // 검색 결과는 짧은 캐시 시간 설정
    response.headers.set(
      'Cache-Control', 
      's-maxage=30, stale-while-revalidate=60'
    )
    
    return response
    
  } catch (error) {
    console.error('검색 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}