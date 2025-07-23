import { Metadata } from 'next'
// notFound는 실제로 사용되지 않지만 향후 필요할 수 있어 import 유지
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { generateSocialMeta, getDefaultMetadata } from '@/lib/social-meta'

// 최소한의 테스트 버전
// export const dynamic = 'force-dynamic'

// 수정 필요
// export const dynamic = 'force-dynamic' // 이 줄 제거 또는 주석
export const revalidate = 300 // 5분마다 재검증 (소셜 미디어 캐시 고려)

// User-Agent 기반 크롤러 감지 함수 (기존 유지)
function isCrawler(userAgent: string): boolean {
  const crawlers = [
    'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot',
    'WhatsApp', 'Slackbot', 'TelegramBot', 'Discord', 'Googlebot',
    'Bingbot', 'YandexBot', 'DuckDuckBot'
  ]
  return crawlers.some(crawler => userAgent.toLowerCase().includes(crawler.toLowerCase()))
}

// 🔥 SEO 최적화 메타데이터 생성 (소셜 미디어 공유 기능 완전 보존)
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  console.log('🔥 SEO 최적화 단축 URL 메타데이터 v8.0 - 정규 URL 강화')
  
  try {
    const { code } = await params
    
    // 🔥 6자가 아닌 코드는 메타데이터에서도 기본값 반환
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return getDefaultMetadata()
    }
    
    // 🔥 타임아웃 증가로 안정성 향상
    const { data: article, error } = await Promise.race([
      supabase
        .from('articles')
        .select(`
          id, 
          title, 
          content, 
          seo_description, 
          thumbnail, 
          author, 
          published_at, 
          updated_at,
          category:categories(name)
        `)
        .eq('short_code', code)
        .eq('status', 'published')
        .single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
    ]) as any
    
    if (error || !article) {
      return getDefaultMetadata()
    }
    
    // 설명 생성
    let description = article.seo_description
    if (!description && article.content) {
      const plainText = article.content.replace(/<[^>]*>/g, '').trim()
      description = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }
    description = description || '픽틈 아티클'
    
    // 🔥 이미지 URL 절대 경로 보장
    const imageUrl = article.thumbnail 
      ? (article.thumbnail.startsWith('http') 
          ? article.thumbnail 
          : `https://www.pickteum.com${article.thumbnail}`)
      : 'https://www.pickteum.com/pickteum_og.png'
    
    // 🔥 카테고리 이름 안전하게 추출
    const categoryName = Array.isArray(article.category) 
      ? (article.category as any[])[0]?.name 
      : (article.category as any)?.name
    
    // 🔥 단축 URL용 완전한 메타데이터 (소셜 미디어 공유 완전 보존)
    const metadata = {
      ...generateSocialMeta({
        title: article.title, // 브랜드명 없이 순수 제목만
        description,
        imageUrl,
        url: `https://www.pickteum.com/article/${article.id}`, // 🔥 원본 아티클 URL로 설정
        type: 'article',
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
        section: categoryName,
        content: article.content, // 키워드 추출용
        categoryName: categoryName
      }),
      // 🔥 색인 허용하되 중복 방지 (canonical로 원본 지정)
      robots: {
        index: true,
        follow: true,
        noarchive: true, // 캐시된 버전은 차단 (중복 방지)
      },
      // 🔥 단축 URL용 추가 설정 - 반드시 원본 아티클로 canonical 설정
      alternates: {
        canonical: `https://www.pickteum.com/article/${article.id}` // 정규 URL 설정
      }
    }
    
    console.log('🔥 SEO 최적화 메타데이터 생성 완료', {
      title: metadata.title,
      imageUrl: metadata.openGraph?.images?.[0]?.url,
      shortCode: code,
      articleId: article.id,
      canonical: `https://www.pickteum.com/article/${article.id}`
    })
    return metadata
    
  } catch (error) {
    console.error('🔥 메타데이터 생성 오류:', error)
    return getDefaultMetadata()
  }
}

// 페이지 컴포넌트 - 🔥 소셜 미디어 공유와 뒤로가기 기능 완전 보존
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  // 🔥 6자가 아닌 코드는 301로 홈페이지로 리다이렉트
  if (!code || typeof code !== 'string' || code.length !== 6) {
    console.log('❌ 잘못된 코드 형식 - 홈으로 301 리다이렉트:', code)
    
    // 301 영구 리다이렉트로 처리
    const headersList = await headers()
    const host = headersList.get('host') || 'www.pickteum.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    return NextResponse.redirect(new URL('/', baseUrl), { status: 301 })
  }
  
  // User-Agent 확인 (기존 로직 유지)
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  
  console.log('🔍 User-Agent:', userAgent)
  console.log('🤖 크롤러 여부:', isCrawler(userAgent))
  
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, views, content, category:categories(name)')
    .eq('short_code', code)
    .eq('status', 'published')
    .single()
  
  // 🔥 아티클이 없거나 비공개인 경우 410 Gone 응답
  if (error || !article) {
    console.log('💀 아티클을 찾을 수 없음 - 410 Gone 반환:', { code, error: error?.message })
    
    // 크롤러인 경우 410 Gone 상태와 함께 간단한 HTML 반환
    if (isCrawler(userAgent)) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>콘텐츠가 삭제되었습니다 - 픽틈</title>
          <meta name="robots" content="noindex, nofollow">
        </head>
        <body>
          <h1>410 - 콘텐츠가 삭제되었습니다</h1>
          <p>요청하신 콘텐츠는 영구적으로 삭제되었습니다.</p>
        </body>
        </html>`,
        { 
          status: 410,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      )
    }
    
    // 일반 사용자는 홈으로 301 리다이렉트
    const host = headersList.get('host') || 'www.pickteum.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`
    
    return NextResponse.redirect(new URL('/', baseUrl), { status: 301 })
  }
  
  // 조회수 증가 (백그라운드 - 기존 유지)
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .then()
  
  // 🔥 카테고리 이름 안전하게 추출 (공통 사용)
  const categoryName = Array.isArray(article.category) 
    ? (article.category as any[])[0]?.name 
    : (article.category as any)?.name
  
  // 🔥 크롤러인 경우: 색인 생성을 위한 개선된 HTML 반환 (소셜 미디어 기능 보존)
  if (isCrawler(userAgent)) {
    console.log('🤖 크롤러 감지 - 색인 최적화된 HTML 반환')
    
    // 콘텐츠 요약 생성
    const contentSummary = article.content ? 
      article.content.replace(/<[^>]*>/g, '').substring(0, 300) : 
      `${article.title} - 픽틈에서 제공하는 ${categoryName || '뉴스'} 콘텐츠입니다.`
    
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
        <header>
          <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#212121' }}>
            {article.title}
          </h1>
          <p style={{ color: '#767676', marginBottom: '20px' }}>
            카테고리: {categoryName || '뉴스'} | 픽틈
          </p>
        </header>
        
        <main>
          <p style={{ lineHeight: '1.6', color: '#333333', marginBottom: '20px' }}>
            {contentSummary}
          </p>
          
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#666666' }}>
              이 콘텐츠는 픽틈에서 제공하는 {categoryName || '뉴스'} 정보입니다.
              전체 내용은 <a href={`https://www.pickteum.com/article/${article.id}`} style={{ color: '#007bff' }}>
                원본 페이지
              </a>에서 확인하실 수 있습니다.
            </p>
          </div>
        </main>
        
        {/* SEO 최적화된 메타데이터 */}
        <meta name="robots" content="index, follow, noarchive" />
        <meta name="description" content={`${article.title} - 픽틈`} />
        <link rel="canonical" href={`https://www.pickteum.com/article/${article.id}`} />
        
        {/* 구조화된 데이터 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": article.title,
              "description": contentSummary,
              "url": `https://www.pickteum.com/article/${article.id}`,
              "mainEntityOfPage": `https://www.pickteum.com/article/${article.id}`,
              "publisher": {
                "@type": "Organization",
                "name": "픽틈",
                "url": "https://www.pickteum.com"
              },
              "articleSection": categoryName || "뉴스"
            })
          }}
        />
      </div>
    )
  }
  
  // 🔥 일반 사용자: 301 영구 리다이렉트로 변경
  console.log('👤 일반 사용자 - 301 영구 리다이렉트')
  
  // 현재 호스트 정보 가져오기
  const host = headersList.get('host') || 'www.pickteum.com'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  
  // Next.js 15에서 영구 리다이렉트를 위해 Response 객체 사용
  return NextResponse.redirect(
    new URL(`/article/${article.id}`, baseUrl),
    { status: 301 }
  )
} 