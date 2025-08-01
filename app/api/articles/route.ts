import { NextRequest, NextResponse } from 'next/server'
import supabase from "@/lib/supabase"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getImageUrl } from "@/lib/utils"

// 🔥 Edge Cache 설정 - 1분 캐시, 5분간 stale-while-revalidate
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('limit') || '5')
    const category = searchParams.get('category') || '전체'

    // 유효성 검사
    if (page < 1 || pageSize < 1 || pageSize > 20) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const from = (page - 1) * pageSize
    const to = page * pageSize - 1

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        thumbnail,
        published_at,
        created_at,
        slug,
        category_id,
        categories!inner(name, color)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)

    // 카테고리 필터링
    if (category !== '전체') {
      // 카테고리 ID 조회
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('API: 아티클 조회 오류:', error)
      return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
    }

    // 아티클 데이터 포맷팅
    const formattedArticles = articles?.map(article => ({
      id: article.slug || article.id,
      title: article.title,
      category: {
        name: (article as any).categories?.name || '미분류',
        color: (article as any).categories?.color || '#cccccc'
      },
      thumbnail: getImageUrl(article.thumbnail),
      date: article.published_at ? 
        format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
        format(new Date(), 'yyyy.MM.dd', { locale: ko }),
      publishedAt: article.published_at
    })) || []

    const response = NextResponse.json({
      articles: formattedArticles,
      hasMore: formattedArticles.length === pageSize,
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