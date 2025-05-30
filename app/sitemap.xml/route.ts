import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

const POSTS_PER_PAGE = 20

export async function GET() {
  try {
    // 발행된 아티클 조회
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, slug, updated_at, published_at, created_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('사이트맵 아티클 조회 오류:', error)
    }

    // 전체 아티클 수 조회
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // 카테고리 조회
    const { data: categories } = await supabase
      .from('categories')
      .select('name')

    const baseUrl = 'https://www.pickteum.com'
    const currentDate = new Date().toISOString()
    const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)

    // XML 생성 - 🔥 SEO 최적화된 사이트맵
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- 홈페이지 -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 페이지네이션 -->
  ${Array.from({ length: Math.min(totalPages, 50) }, (_, i) => { // 최대 50페이지까지만
    const page = i + 1
    if (page === 1) return '' // 홈페이지와 중복 방지
    
    return `  <url>
    <loc>${baseUrl}/page/${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
  }).join('\n')}
  
  <!-- 정적 페이지 -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/youth-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/careers</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <!-- 🔥 카테고리 페이지 (SEO 중요도 향상) -->
  ${categories?.map(category => `  <url>
    <loc>${baseUrl}/category/${encodeURIComponent(category.name)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n') || ''}
  
  <!-- 🔥 아티클 페이지 (최고 우선순위) -->
  ${articles?.map(article => {
    const url = article.slug ? 
      `${baseUrl}/article/${article.slug}` : 
      `${baseUrl}/article/${article.id}`
    const lastmod = article.updated_at || article.published_at || article.created_at
    
    // 최근 7일 내 아티클은 더 높은 우선순위
    const publishDate = new Date(article.published_at || article.created_at)
    const daysSincePublish = Math.floor((Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
    const priority = daysSincePublish <= 7 ? '0.95' : '0.9'
    const changeFreq = daysSincePublish <= 7 ? 'daily' : 'weekly'
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n') || ''}
  
  <!-- RSS 피드 -->
  <url>
    <loc>${baseUrl}/feed.xml</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- 뉴스 사이트맵 -->
  <url>
    <loc>${baseUrl}/news-sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
      },
    })
  } catch (error) {
    console.error('사이트맵 생성 오류:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 