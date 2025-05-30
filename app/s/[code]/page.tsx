import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'
import { generateSocialMeta, getDefaultMetadata as getLibDefaultMetadata } from '@/lib/social-meta'

// 최소한의 테스트 버전
// export const dynamic = 'force-dynamic'

// 수정 필요
// export const dynamic = 'force-dynamic' // 이 줄 제거 또는 주석
export const revalidate = 60 // 60초마다 재검증

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  // 강제 에러 발생으로 함수 실행 확인
  console.error('🔥🔥🔥 메타데이터 함수 실행 확인 - 에러 로그')
  
  try {
    const { code } = await params
    
    // 코드 검증 최적화
    if (!code || code.length !== 6) {
      return getLibDefaultMetadata()
    }
    
    // 타임아웃 설정으로 크롤러 응답 최적화
    const { data: article, error } = await Promise.race([
      supabase
        .from('articles')
        .select('id, title, summary, thumbnail, author, category:categories(name)')
        .eq('short_code', code)
        .eq('status', 'published')
        .single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]) as any
    
    if (error || !article) {
      return getLibDefaultMetadata()
    }
    
    // 간단한 메타데이터 생성 (빠른 응답)
    return generateSocialMeta({
      title: `${article.title} | 픽틈`,
      description: article.summary || '픽틈 아티클',
      imageUrl: article.thumbnail || 'https://www.pickteum.com/pickteum_og.png',
      url: `https://www.pickteum.com/s/${code}`,
      type: 'article'
    })
    
  } catch (error) {
    console.error('🔥 메타데이터 생성 오류:', error)
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

// 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  if (!code || typeof code !== 'string' || code.length !== 6) {
    notFound()
  }
  
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, views')
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
    .then(({ error }) => {
      if (error) {
        console.log('조회수 증가 실패:', error.message)
      }
    })
  
  // 즉시 redirect
  redirect(`/article/${article.id}`)
} 