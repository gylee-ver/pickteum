// 메타데이터 디버깅 API
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
  }

  try {
    // URL 페이지의 HTML을 가져와서 메타 태그 추출
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch page: ${response.status}`,
        url,
        accessible: false
      })
    }

    const html = await response.text()
    
    // 메타 태그 추출
    const metaTags = {
      title: extractMetaContent(html, 'title'),
      description: extractMetaContent(html, 'description'),
      ogTitle: extractMetaContent(html, 'og:title'),
      ogDescription: extractMetaContent(html, 'og:description'),
      ogImage: extractMetaContent(html, 'og:image'),
      ogUrl: extractMetaContent(html, 'og:url'),
      ogType: extractMetaContent(html, 'og:type'),
      ogSiteName: extractMetaContent(html, 'og:site_name'),
      ogLocale: extractMetaContent(html, 'og:locale'),
      twitterCard: extractMetaContent(html, 'twitter:card'),
      twitterTitle: extractMetaContent(html, 'twitter:title'),
      twitterDescription: extractMetaContent(html, 'twitter:description'),
      twitterImage: extractMetaContent(html, 'twitter:image'),
      twitterCreator: extractMetaContent(html, 'twitter:creator'),
      twitterSite: extractMetaContent(html, 'twitter:site'),
      canonical: extractCanonical(html)
    }

    // 이미지 접근성 검사
    let imageValidation = null
    if (metaTags.ogImage) {
      try {
        const imageResponse = await fetch(metaTags.ogImage, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        })
        imageValidation = {
          accessible: imageResponse.ok,
          status: imageResponse.status,
          contentType: imageResponse.headers.get('content-type'),
          size: imageResponse.headers.get('content-length')
        }
      } catch (error) {
        imageValidation = {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    return NextResponse.json({
      url,
      accessible: true,
      metaTags,
      imageValidation,
      recommendations: generateRecommendations(metaTags)
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: errorMessage,
      url,
      accessible: false
    })
  }
}

// 메타 태그 내용 추출
function extractMetaContent(html: string, property: string): string | null {
  // title 태그 처리
  if (property === 'title') {
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    return titleMatch ? titleMatch[1].trim() : null
  }

  // description 메타 태그
  if (property === 'description') {
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*?)["']/i)
    return descMatch ? descMatch[1].trim() : null
  }

  // Open Graph 태그들
  const ogMatch = html.match(new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["']([^"']*?)["']`, 'i'))
  if (ogMatch) return ogMatch[1].trim()

  // Twitter 태그들
  const twitterMatch = html.match(new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["']([^"']*?)["']`, 'i'))
  if (twitterMatch) return twitterMatch[1].trim()

  return null
}

// canonical URL 추출
function extractCanonical(html: string): string | null {
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*?)["']/i)
  return canonicalMatch ? canonicalMatch[1].trim() : null
}

// 개선 추천사항 생성
function generateRecommendations(metaTags: any): string[] {
  const recommendations = []

  if (!metaTags.ogTitle) {
    recommendations.push('og:title 메타 태그가 누락되었습니다.')
  }

  if (!metaTags.ogDescription) {
    recommendations.push('og:description 메타 태그가 누락되었습니다.')
  }

  if (!metaTags.ogImage) {
    recommendations.push('og:image 메타 태그가 누락되었습니다.')
  }

  if (!metaTags.ogUrl) {
    recommendations.push('og:url 메타 태그가 누락되었습니다.')
  }

  if (!metaTags.twitterCard) {
    recommendations.push('twitter:card 메타 태그가 누락되었습니다.')
  }

  if (metaTags.ogDescription && metaTags.ogDescription.length > 160) {
    recommendations.push('og:description이 160자를 초과합니다.')
  }

  if (metaTags.ogTitle && metaTags.ogTitle.length > 60) {
    recommendations.push('og:title이 60자를 초과합니다.')
  }

  if (recommendations.length === 0) {
    recommendations.push('모든 주요 메타 태그가 올바르게 설정되어 있습니다!')
  }

  return recommendations
} 