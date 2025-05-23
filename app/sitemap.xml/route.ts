import { NextResponse } from "next/server"
import supabase from "@/lib/supabase"

export async function GET() {
  try {
    // 사이트 URL
    const baseUrl = "https://pickteum.com"
    
    // 현재 날짜
    const date = new Date().toISOString()

    // 정적 페이지 URL 목록
    const staticUrls = [
      { url: "", priority: "1.0", changefreq: "daily" },
      { url: "terms", priority: "0.5", changefreq: "monthly" },
      { url: "privacy", priority: "0.5", changefreq: "monthly" },
      { url: "youth-policy", priority: "0.5", changefreq: "monthly" },
    ]

    // 게시글 목록 가져오기
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    if (articlesError) {
      console.error('게시글 조회 오류:', articlesError)
      throw articlesError
    }

    // 카테고리 목록 가져오기
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name')

    if (categoriesError) {
      console.error('카테고리 조회 오류:', categoriesError)
      throw categoriesError
    }

    // XML 시작 부분
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

    // 정적 페이지 URL 추가
    staticUrls.forEach(({ url, priority, changefreq }) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/${url}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })

    // 카테고리 페이지 URL 추가
    categories?.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/category/${category.name.toLowerCase()}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // 게시글 URL 추가
    articles?.forEach(article => {
      sitemap += `
  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${article.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    // XML 종료
    sitemap += `
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    })

  } catch (error) {
    console.error('사이트맵 생성 오류:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
