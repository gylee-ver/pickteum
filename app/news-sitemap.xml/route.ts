import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
    // 최근 48시간 내 발행된 아티클만 뉴스 사이트맵에 포함
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const { data: recentArticles, error } = await supabase
      .from('articles')
      .select(`
        id, 
        slug, 
        title, 
        seo_description, 
        content,
        published_at, 
        created_at,
        category:categories(name)
      `)
      .eq('status', 'published')
      .gte('published_at', twoDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(1000) // Google 뉴스 사이트맵 제한

    if (error) {
      console.error('뉴스 사이트맵 아티클 조회 오류:', error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    const baseUrl = 'https://www.pickteum.com'

    // 🔥 Google News 최적화된 XML 생성
    const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles?.map(article => {
  // 키워드 추출 (제목과 카테고리에서)
  const categoryData = Array.isArray(article.category) 
    ? article.category[0] 
    : article.category;
  const keywords = [
    categoryData?.name || '',
    ...article.title.split(' ').filter((word: string) => word.length > 2).slice(0, 3)
  ].filter(Boolean).join(', ')

  // 설명 생성
  const description = article.seo_description || 
    (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '')

  return `  <url>
    <loc>${baseUrl}/article/${article.id}</loc>
    <news:news>
      <news:publication>
        <news:name>픽틈</news:name>
        <news:language>ko</news:language>
      </news:publication>
      <news:publication_date>${article.published_at || article.created_at}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      ${keywords ? `<news:keywords><![CDATA[${keywords}]]></news:keywords>` : ''}
    </news:news>
    <lastmod>${article.published_at || article.created_at}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.9</priority>
  </url>`
}).join('\n') || ''}
</urlset>`

    return new NextResponse(newsSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30분 캐시
      },
    })
  } catch (error) {
    console.error('뉴스 사이트맵 생성 오류:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 