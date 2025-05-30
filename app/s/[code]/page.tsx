import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'
import { generateSocialMeta, getDefaultMetadata as getLibDefaultMetadata, validateImageUrl } from '@/lib/social-meta'

// 최소한의 테스트 버전
export const dynamic = 'force-dynamic'

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  try {
    const { code } = await params
    
    // 코드 유효성 검사
    if (!code || typeof code !== 'string' || code.length !== 6) {
      return getLibDefaultMetadata()
    }
    
    // 안전한 쿼리
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        thumbnail,
        seo_title,
        seo_description,
        author,
        tags,
        published_at,
        created_at,
        updated_at,
        short_code,
        category_id
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      return getLibDefaultMetadata()
    }

    // 메타데이터 생성
    const title = (article.seo_title || article.title || '픽틈').trim()
    const description = (article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '') ||
      '픽틈에서 제공하는 유익한 콘텐츠입니다.').trim()
    
    // 썸네일 URL 처리 및 검증
    let thumbnailUrl = 'https://www.pickteum.com/pickteum_og.png'
    
    if (article.thumbnail && typeof article.thumbnail === 'string') {
      let candidateUrl = ''
      
      if (article.thumbnail.startsWith('http')) {
        candidateUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        candidateUrl = `https://www.pickteum.com${article.thumbnail}`
      } else {
        candidateUrl = `https://www.pickteum.com/${article.thumbnail}`
      }
      
      // 이미지 접근성 검증 (타임아웃 적용)
      try {
        const isValid = await Promise.race([
          validateImageUrl(candidateUrl),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ])
        
        if (isValid) {
          thumbnailUrl = candidateUrl
        }
      } catch (error) {
        console.warn('썸네일 검증 실패, 기본 이미지 사용:', error)
      }
    }

    // 소셜 메타데이터 생성
    const socialMeta = generateSocialMeta({
      title: `${title} | 픽틈`,
      description,
      imageUrl: thumbnailUrl,
      url: `https://www.pickteum.com/s/${code}`,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at,
      author: article.author || '픽틈',
    })

    return {
      ...socialMeta,
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      authors: [{ name: article.author || '픽틈' }],
      alternates: {
        canonical: `https://www.pickteum.com/article/${article.id}`,
      },
    }

  } catch (error) {
    console.error('메타데이터 생성 오류:', error)
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