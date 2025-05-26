import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
    // 최신 발행된 아티클 20개 조회
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        slug,
        author,
        published_at,
        created_at,
        updated_at,
        thumbnail,
        seo_description,
        category:categories(name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('RSS 피드 아티클 조회 오류:', error)
    }

    const baseUrl = 'https://pickteum.com'
    const currentDate = new Date().toUTCString()

    // RSS XML 생성
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>픽틈 - 당신의 정크 타임을, 스마일 타임으로!</title>
    <description>건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 콘텐츠를 제공하는 모바일 퍼스트 플랫폼</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <pubDate>${currentDate}</pubDate>
    <ttl>60</ttl>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/pickteum_og.png</url>
      <title>픽틈</title>
      <link>${baseUrl}</link>
      <width>1200</width>
      <height>630</height>
    </image>
    
    ${articles?.map(article => {
      const pubDate = new Date(article.published_at || article.created_at).toUTCString()
      const articleUrl = `${baseUrl}/article/${article.slug || article.id}`
      const description = article.seo_description || 
        (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 200) : '') ||
        '픽틈에서 제공하는 유익한 콘텐츠입니다.'
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${article.content || ''}]]></content:encoded>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${article.author || 'pickteum'}</author>
      <category>${article.category?.name || '미분류'}</category>
      ${article.thumbnail ? `<enclosure url="${article.thumbnail.startsWith('http') ? article.thumbnail : baseUrl + article.thumbnail}" type="image/jpeg"/>` : ''}
    </item>`
    }).join('') || ''}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })

  } catch (error) {
    console.error('RSS 피드 생성 오류:', error)
    
    // 오류 시 기본 RSS 반환
    const basicRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>픽틈</title>
    <description>당신의 정크 타임을, 스마일 타임으로!</description>
    <link>https://pickteum.com</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new NextResponse(basicRss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
} 