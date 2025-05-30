import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import supabase from '@/lib/supabase'
import { generateSocialMeta, getDefaultMetadata as getLibDefaultMetadata } from '@/lib/social-meta'

// 최소한의 테스트 버전
// export const dynamic = 'force-dynamic'

// 수정 필요
// export const dynamic = 'force-dynamic' // 이 줄 제거 또는 주석
export const revalidate = 60 // 60초마다 재검증

// 크롤러 감지 함수
function isCrawler(userAgent: string): boolean {
  const crawlerPatterns = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'Googlebot',
    'bingbot',
    'Slackbot',
    'TelegramBot',
    'Discord',
    'Applebot',
    'PinterestBot',
    'redditbot',
    'crawler',
    'spider',
    'bot'
  ]
  
  const lowerUserAgent = userAgent.toLowerCase()
  return crawlerPatterns.some(pattern => lowerUserAgent.includes(pattern.toLowerCase()))
}

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  console.log('🆕 NEW VERSION: 단축 URL 메타데이터 v3.0')
  
  try {
    const { code } = await params
    console.log('🔥 받은 코드:', code)
    
    if (!code || code.length !== 6) {
      console.log('🔥 코드 검증 실패')
      return getLibDefaultMetadata()
    }
    
    console.log('🔥 데이터베이스 조회 시작:', code)
    
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, content, seo_description, thumbnail, author, category:categories(name)')
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('🔥 데이터베이스 결과:', { article: !!article, error: error?.message })
    
    if (error || !article) {
      console.log('🔥 아티클 없음, 기본 메타데이터 반환')
      return getLibDefaultMetadata()
    }
    
    console.log('🔥 메타데이터 생성:', article.title)
    
    let description = article.seo_description
    if (!description && article.content) {
      const plainText = article.content.replace(/<[^>]*>/g, '').trim()
      description = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }
    description = description || '픽틈 아티클'
    
    const metadata = generateSocialMeta({
      title: `${article.title} | 픽틈`,
      description,
      imageUrl: article.thumbnail || 'https://www.pickteum.com/pickteum_og.png',
      url: `https://www.pickteum.com/s/${code}`,
      type: 'article'
    })
    
    console.log('🔥 생성된 메타데이터:', JSON.stringify(metadata, null, 2))
    return metadata
    
  } catch (error) {
    console.error('🆕 메타데이터 생성 오류:', error)
    return getLibDefaultMetadata()
  }
}

// 기본 메타데이터 생성 함수
function getDefaultMetadata(): Metadata {
  return {
    title: '틈 날 땐? 픽틈!',
    description: '요청하신 콘텐츠를 찾을 수 없습니다.',
    openGraph: {
      title: '틈 날 땐? 픽틈!',
      description: '틈새 시간을, 이슈 충전 타임으로!',
      type: 'website',
      images: [
        {
          url: 'https://www.pickteum.com/pickteum_og.png',
          width: 1200,
          height: 630,
          alt: '틈 날 땐? 픽틈!',
        },
      ],
      url: 'https://www.pickteum.com',
      siteName: '픽틈',
      locale: 'ko_KR',
    },
  }
}

// 페이지 컴포넌트 - 크롤러 감지 로직 추가
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  if (!code || typeof code !== 'string' || code.length !== 6) {
    notFound()
  }
  
  // User-Agent 확인
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  
  console.log('🔍 User-Agent:', userAgent)
  console.log('🤖 크롤러 여부:', isCrawler(userAgent))
  
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, views')
    .eq('short_code', code)
    .eq('status', 'published')
    .single()
  
  if (error || !article) {
    notFound()
  }
  
  // 조회수 증가 (백그라운드)
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .then()
  
  // 크롤러인 경우: 메타데이터를 읽을 수 있는 HTML 반환
  if (isCrawler(userAgent)) {
    console.log('🤖 크롤러 감지 - HTML 반환')
    return (
      <div style={{ display: 'none' }}>
        <h1>{article.title}</h1>
        <meta name="robots" content="noindex" />
        {/* 크롤러가 메타데이터를 읽을 수 있도록 HTML 제공 */}
      </div>
    )
  }
  
  // 일반 사용자인 경우: 즉시 리다이렉트
  console.log('👤 일반 사용자 - 리다이렉트')
  redirect(`/article/${article.id}`)
} 