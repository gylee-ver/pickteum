import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

// XML 특수 문자 이스케이프 함수
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// 안전한 텍스트 처리 함수
function sanitizeText(text: string): string {
  if (!text) return '';
  
  // HTML 태그 제거
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // 특수 문자 이스케이프
  const escapedText = escapeXml(cleanText);
  
  // 연속된 공백 정리
  return escapedText.replace(/\s+/g, ' ').trim();
}

// 유효한 URL 확인 함수
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    // 최근 50개 발행된 아티클 조회
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        seo_description,
        published_at,
        updated_at,
        category:categories(name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('RSS 피드 아티클 조회 오류:', error)
    }

    const baseUrl = 'https://www.pickteum.com'
    
    // RSS XML 생성
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>픽틈</title>
    <description>틈새 시간을, 이슈 충전 타임으로!</description>
    <link>${baseUrl}</link>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>info@pickteum.com (픽틈)</managingEditor>
    <webMaster>info@pickteum.com (픽틈)</webMaster>
    <copyright>© ${new Date().getFullYear()} 픽틈. All rights reserved.</copyright>
    <category>뉴스</category>
    <generator>Next.js</generator>
    
    ${articles?.map(article => {
      const cleanContent = article.content?.replace(/<[^>]*>/g, '') || ''
      const description = article.seo_description || cleanContent.substring(0, 200) + '...'
      
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <content:encoded><![CDATA[${article.content || ''}]]></content:encoded>
      <link>${baseUrl}/article/${article.id}</link>
      <guid isPermaLink="true">${baseUrl}/article/${article.id}</guid>
      <pubDate>${new Date(article.published_at).toUTCString()}</pubDate>
      <category><![CDATA[${(article.category as any)?.name || '뉴스'}]]></category>
      <source url="${baseUrl}/feed.xml">픽틈</source>
    </item>`
    }).join('') || ''}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
      },
    })
  } catch (error) {
    console.error('RSS 피드 생성 오류:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}