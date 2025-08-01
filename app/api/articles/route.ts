import { NextRequest, NextResponse } from 'next/server'
import { getArticles } from '@/lib/data'

// 🔥 Edge Cache 설정 - 1분 캐시, 5분간 stale-while-revalidate
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')
    const category = searchParams.get('category') || '전체'

    // 유효성 검사
    if (page < 1 || limit < 1 || limit > 20) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const { articles, hasMore } = await getArticles({
      page,
      limit,
      category
    })

    const response = NextResponse.json({
      articles,
      hasMore,
      page,
      category
    })

    // 🔥 Edge Cache 헤더 설정 - 60초 캐시, 300초 stale-while-revalidate
    response.headers.set(
      'Cache-Control', 
      's-maxage=60, stale-while-revalidate=300'
    )
    
    return response

  } catch (error) {
    console.error('API: 예외 발생:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}