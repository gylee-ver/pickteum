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
      console.error('Supabase 오류:', error)
      throw error
    }

    const baseUrl = 'https://www.pickteum.com'
    const currentDate = new Date().toISOString()

    // 아티클 아이템 생성
    const items = (articles || []).map(article => {
      // 날짜 처리
      const pubDate = new Date(article.published_at || article.created_at).toISOString()
      
      // URL 생성
      const articleUrl = `${baseUrl}/article/${article.slug || article.id}`
      
      // 제목 처리
      const title = sanitizeText(article.title || '제목 없음')
      
      // 설명 처리
      let description = '';
      if (article.seo_description) {
        description = sanitizeText(article.seo_description);
      } else if (article.content) {
        const plainText = article.content.replace(/<[^>]*>/g, '');
        description = sanitizeText(plainText.substring(0, 200));
      } else {
        description = '픽틈에서 제공하는 유익한 콘텐츠입니다.';
      }
      
      // 작성자 처리
      const author = sanitizeText(article.author || 'pickteum')
      
      // 카테고리 처리
      const category = sanitizeText(article.category?.name || '미분류')
      
      // 썸네일 처리
      let enclosureTag = ''
      if (article.thumbnail) {
        let thumbnailUrl = article.thumbnail
        
        // 상대 URL을 절대 URL로 변환
        if (!thumbnailUrl.startsWith('http')) {
          thumbnailUrl = `${baseUrl}${thumbnailUrl.startsWith('/') ? '' : '/'}${thumbnailUrl}`
        }
        
        // URL 유효성 검사
        if (isValidUrl(thumbnailUrl)) {
          enclosureTag = `      <enclosure url="${escapeXml(thumbnailUrl)}" type="image/jpeg" length="0" />`
        }
      }

      return `    <item>
      <title>${title}</title>
      <link>${escapeXml(articleUrl)}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(articleUrl)}</guid>
      <dc:creator>${author}</dc:creator>
      <category>${category}</category>
${enclosureTag}
    </item>`
    }).join('\n')

    // RSS XML 생성
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
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
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
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
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    })

  } catch (error) {
    console.error('RSS 피드 생성 오류:', error)
    
    // 오류 시 최소한의 유효한 RSS 반환
    const basicRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>틈 날 땐? 픽틈!</title>
    <link>https://www.pickteum.com</link>
    <description>틈새 시간을, 이슈 충전 타임으로!</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
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