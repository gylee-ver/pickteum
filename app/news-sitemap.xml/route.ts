import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
    // 지난 2일 이내 발행된 아티클 조회
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        published_at,
        created_at,
        updated_at,
        category:categories(name)
      `)
      .eq('status', 'published')
      .gte('published_at', twoDaysAgo.toISOString())
      .order('published_at', { ascending: false })
      .limit(100) // Google News는 최대 1000개까지 허용

    if (error) {
      console.error('뉴스 사이트맵 아티클 조회 오류:', error)
    }

    const baseUrl = 'https://www.pickteum.com'

    // Google News Sitemap XML 생성
    const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${articles?.map(article => {
    const url = article.slug ? 
      `${baseUrl}/article/${article.slug}` : 
      `${baseUrl}/article/${article.id}`
    const publishDate = new Date(article.published_at || article.created_at).toISOString()
    const categoryName = (article.category as any)?.name || '뉴스'
    
    return `  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>픽틈</news:name>
        <news:language>ko</news:language>
      </news:publication>
      <news:publication_date>${publishDate}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords>${categoryName}</news:keywords>
    </news:news>
    <lastmod>${article.updated_at || publishDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`
  }).join('\n') || ''}
</urlset>`

    return new NextResponse(newsSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // 30분 캐시 (뉴스는 더 자주 업데이트)
      },
    })
  } catch (error) {
    console.error('뉴스 사이트맵 생성 오류:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 