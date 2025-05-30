import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'
import { generateSocialMeta, getDefaultMetadata as getLibDefaultMetadata } from '@/lib/social-meta'

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
    
    // 카테고리 정보도 함께 가져오기 (풍부한 메타데이터를 위해)
    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        summary,
        thumbnail,
        seo_title,
        seo_description,
        author,
        tags,
        published_at,
        created_at,
        updated_at,
        short_code,
        category_id,
        category:categories(name)
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    if (error || !article) {
      return getLibDefaultMetadata()
    }

    // SEO에 최적화된 제목 생성 (카테고리 포함)
    const seoTitle = article.seo_title || article.title
    const categoryName = (article.category as any)?.name
    const titleWithCategory = categoryName ? `${seoTitle} - ${categoryName}` : seoTitle
    
    // SEO에 최적화된 설명 생성
    let seoDescription = article.seo_description || article.summary
    if (!seoDescription && article.content) {
      // HTML 태그 제거 후 첫 160자 추출
      const plainText = article.content.replace(/<[^>]*>/g, '').trim()
      seoDescription = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '')
    }
    seoDescription = seoDescription || '픽틈에서 제공하는 유익한 콘텐츠입니다.'
    
    // 썸네일 URL 처리 (검증 로직 제거 - 빠른 응답을 위해)
    let thumbnailUrl = 'https://www.pickteum.com/pickteum_og.png'
    
    if (article.thumbnail && typeof article.thumbnail === 'string' && article.thumbnail.trim() !== '') {
      // URL 형식 확인 및 변환
      if (article.thumbnail.startsWith('http')) {
        thumbnailUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        thumbnailUrl = `https://www.pickteum.com${article.thumbnail}`
      } else {
        thumbnailUrl = `https://www.pickteum.com/${article.thumbnail}`
      }
    }

    // 소셜 메타데이터 생성
    const socialMeta = generateSocialMeta({
      title: `${titleWithCategory} | 픽틈`,
      description: seoDescription,
      imageUrl: thumbnailUrl,
      url: `https://www.pickteum.com/s/${code}`,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at,
      author: article.author || '픽틈',
      section: categoryName,
    })

    return {
      ...socialMeta,
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : (typeof article.tags === 'string' ? article.tags : ''),
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