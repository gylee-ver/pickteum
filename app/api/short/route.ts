// URL 단축 API
import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json()
    
    // 기존 article의 slug 조회
    const { data: article, error } = await supabase
      .from('articles')
      .select('slug, title')
      .eq('id', articleId)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      return NextResponse.json({ error: '아티클을 찾을 수 없습니다' }, { status: 404 })
    }
    
    // 단축 URL 생성 (slug 기반)
    const shortUrl = `https://pickteum.com/a/${article.slug}`
    
    return NextResponse.json({
      shortUrl,
      originalUrl: `https://pickteum.com/article/${articleId}`,
      title: article.title
    })
    
  } catch (error) {
    console.error('URL 단축 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
} 