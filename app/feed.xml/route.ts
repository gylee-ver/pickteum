import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

export async function GET() {
  try {
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
      throw error
    }

    const baseUrl = 'https://www.pickteum.com'
    const currentDate = new Date().toUTCString()

    // 아티클 아이템 생성
    const items = (articles || []).map(article => {
      const pubDate = new Date(article.published_at || article.created_at).toUTCString()
      const articleUrl = `${baseUrl}/article/${article.slug || article.id}`
      
      // 썸네일 URL 처리
      let enclosureTag = ''
      if (article.thumbnail) {
        const thumbnailUrl = article.thumbnail.startsWith('http') ? 
          article.thumbnail : 
          `${baseUrl}${article.thumbnail.startsWith('/') ? '' : '/'}${article.thumbnail}`
        enclosureTag = `      <enclosure url="${thumbnailUrl}" type="image/jpeg" length="0"/>`
      }

      return `    <item>
      <title><![CDATA[${article.title || '제목 없음'}]]></title>
      <link>${articleUrl}</link>
      <description><![CDATA[${article.seo_description || 
        (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 200) : '') ||
        '픽틈에서 제공하는 유익한 콘텐츠입니다.'}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${articleUrl}</guid>
      <author>${article.author || 'pickteum'}</author>
      <category>${article.category?.name || '미분류'}</category>
${enclosureTag}
    </item>`
    }).join('\n')

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>틈 날 땐? 픽틈!</title>
    <link>${baseUrl}</link>
    <description>틈새 시간을, 이슈 충전 타임으로! 건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 콘텐츠를 제공하는 모바일 퍼스트 플랫폼</description>
    <language>ko-KR</language>
    <copyright>© 2025 픽틈. All rights reserved.</copyright>
    <managingEditor>admin@pickteum.com (픽틈)</managingEditor>
    <webMaster>admin@pickteum.com (픽틈)</webMaster>
    <pubDate>${currentDate}</pubDate>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <generator>Next.js RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/pickteum_og.png</url>
      <title>틈 날 땐? 픽틈!</title>
      <link>${baseUrl}</link>
      <width>1200</width>
      <height>630</height>
    </image>
${items}
  </channel>
</rss>`

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })

  } catch (error) {
    console.error('RSS 피드 생성 오류:', error)
    
    // 오류 시 기본 RSS 반환
    const basicRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>틈 날 땐? 픽틈!</title>
    <link>https://www.pickteum.com</link>
    <description>틈새 시간을, 이슈 충전 타임으로!</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new NextResponse(basicRss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    })
  }
}