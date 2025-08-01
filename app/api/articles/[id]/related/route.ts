import { NextRequest, NextResponse } from 'next/server'
import { getRelatedArticles } from '@/lib/data'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    if (!id || !categoryId) {
      return NextResponse.json(
        { error: 'Article ID and category ID are required' }, 
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' }, 
        { status: 400 }
      )
    }

    const articles = await getRelatedArticles(categoryId, id, limit)
    
    const response = NextResponse.json({ articles })
    
    // 관련 아티클은 중간 정도의 캐시 시간 설정
    response.headers.set(
      'Cache-Control', 
      's-maxage=120, stale-while-revalidate=300'
    )
    
    return response
    
  } catch (error) {
    console.error('관련 아티클 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}