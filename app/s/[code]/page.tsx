import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { headers } from 'next/headers'
import supabase from '@/lib/supabase'
import { generateSocialMeta } from '@/lib/social-meta'

// 최소한의 테스트 버전
// export const dynamic = 'force-dynamic'

// 수정 필요
// export const dynamic = 'force-dynamic' // 이 줄 제거 또는 주석
export const revalidate = 300 // 5분마다 재검증 (소셜 미디어 캐시 고려)

// 기본 메타데이터 함수 (기존 유지)
function getLibDefaultMetadata(): Metadata {
  return {
    title: '픽틈 - 틈새시간을 이슈충전 타임으로!',
    description: '바쁜 일상 속 틈새시간에 만나는 핵심 이슈! 건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 뉴스와 콘텐츠를 제공합니다.',
    robots: {
      index: true,
      follow: true,
    },
  }
}

// 크롤러 감지 함수 (기존 유지)
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

// 🔥 SEO 최적화 메타데이터 생성 (소셜 미디어 공유 기능 완전 보존)
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  console.log('🔥 SEO 최적화 단축 URL 메타데이터 v5.0')
  
  try {
    const { code } = await params
    
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return getLibDefaultMetadata()
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
      return getLibDefaultMetadata()
    }
    
    // 설명 생성
    let description = article.seo_description
    if (!description && article.content) {
      const plainText = article.content.replace(/<[^>]*>/g, '').trim()
      description = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }
    description = description || '픽틈 아티클'
    
    // 🔥 단축 URL용 완전한 메타데이터 (소셜 미디어 공유 완전 보존)
    const metadata = {
      ...generateSocialMeta({
        title: article.title, // 브랜드명 없이 순수 제목만
        description,
        imageUrl: article.thumbnail || 'https://www.pickteum.com/pickteum_og.png',
        url: `https://www.pickteum.com/article/${article.id}`, // 🔥 원본 아티클 URL로 설정
        type: 'article',
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
        section: Array.isArray(article.category) ? article.category[0]?.name : article.category?.name,
        content: article.content, // 키워드 추출용
        categoryName: Array.isArray(article.category) ? article.category[0]?.name : article.category?.name
      }),
      // 🔥 robots.txt에서 검색엔진 차단하므로 여기서는 소셜 미디어용으로만 최적화
      robots: {
        index: false, // robots.txt에서 이미 차단됨
        follow: true,
      },
      // 🔥 단축 URL용 추가 설정
      alternates: {
        canonical: `https://www.pickteum.com/article/${article.id}` // 정규 URL 설정
      }
    }
    
    console.log('🔥 SEO 최적화 메타데이터 생성 완료')
    return metadata
    
  } catch (error) {
    console.error('🔥 메타데이터 생성 오류:', error)
    return getLibDefaultMetadata()
  }
}

// 페이지 컴포넌트 - 🔥 소셜 미디어 공유와 뒤로가기 기능 완전 보존
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  if (!code || typeof code !== 'string' || code.length !== 6) {
    notFound()
  }
  
  // User-Agent 확인 (기존 로직 유지)
  const headersList = await headers()
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
  
  // 조회수 증가 (백그라운드 - 기존 유지)
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .then()
  
  // 🔥 크롤러인 경우: 색인 생성을 위한 개선된 HTML 반환 (소셜 미디어 기능 보존)
  if (isCrawler(userAgent)) {
    console.log('🤖 크롤러 감지 - 색인 최적화된 HTML 반환')
    return (
      <div style={{ display: 'none' }}>
        <h1>{article.title}</h1>
        {/* 🔥 noindex 제거 - 색인 생성 허용하면서 소셜 미디어 메타데이터는 그대로 유지 */}
        <meta name="robots" content="index, follow" />
        <meta name="description" content={`${article.title} - 픽틈`} />
        <link rel="canonical" href={`https://www.pickteum.com/article/${article.id}`} />
        {/* 크롤러가 메타데이터를 읽을 수 있도록 HTML 제공 */}
      </div>
    )
  }
  
  // 🔥 일반 사용자인 경우: 즉시 리다이렉트 (뒤로가기 기능 완전 보존)
  console.log('👤 일반 사용자 - 리다이렉트')
  redirect(`/article/${article.id}`)
} 