import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import supabase from '@/lib/supabase'

// 최소한의 테스트 버전
export const dynamic = 'force-dynamic'

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  try {
    const { code } = await params
    
    console.log('=== 숏 URL generateMetadata 시작 ===', code)
    
    // 안전한 쿼리 (조인 없이)
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
        category_id
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('숏 URL generateMetadata 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      code,
      articleId: article?.id
    })
    
    if (error || !article) {
      console.log('숏 URL: 아티클을 찾을 수 없음:', error?.message)
      return {
        title: '픽틈 - 당신의 정크 타임을, 스마일 타임으로!',
        description: '요청하신 콘텐츠를 찾을 수 없습니다.',
        openGraph: {
          title: '픽틈',
          description: '당신의 정크 타임을, 스마일 타임으로!',
          type: 'website',
          images: [
            {
              url: 'https://pickteum.com/pickteum_og.png',
              width: 1200,
              height: 630,
              alt: '픽틈',
            },
          ],
          url: 'https://pickteum.com',
          siteName: '픽틈',
          locale: 'ko_KR',
        },
      }
    }

    // 안전한 메타데이터 구성
    const title = (article.seo_title || article.title || '픽틈').trim()
    const description = (article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '') ||
      '픽틈에서 제공하는 유익한 콘텐츠입니다.').trim()
    
    let imageUrl = 'https://pickteum.com/pickteum_og.png'
    try {
      if (article.thumbnail && typeof article.thumbnail === 'string') {
        if (article.thumbnail.startsWith('http')) {
          imageUrl = article.thumbnail
        } else if (article.thumbnail.startsWith('/')) {
          imageUrl = `https://pickteum.com${article.thumbnail}`
        } else {
          imageUrl = `https://pickteum.com/${article.thumbnail}`
        }
      }
    } catch (imgError) {
      console.log('숏 URL 이미지 처리 오류 (기본값 사용):', imgError)
    }

    console.log('=== 숏 URL generateMetadata 성공 완료 ===')

    return {
      title: `${title} | 픽틈`,
      description,
      keywords: Array.isArray(article.tags) ? article.tags.join(', ') : '',
      authors: [{ name: article.author || '픽틈' }],
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author || '픽틈'],
        section: '픽틈',
        tags: Array.isArray(article.tags) ? article.tags : [],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        url: `https://pickteum.com/s/${code}`,
        siteName: '픽틈',
        locale: 'ko_KR',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
        creator: '@pickteum',
        site: '@pickteum',
      },
      alternates: {
        canonical: `https://pickteum.com/article/${article.id}`,
      },
    }

  } catch (error) {
    console.error('숏 URL generateMetadata 치명적 오류:', error)
    
    return {
      title: '픽틈 - 당신의 정크 타임을, 스마일 타임으로!',
      description: '유익한 콘텐츠를 제공하는 픽틈입니다.',
      openGraph: {
        title: '픽틈',
        description: '당신의 정크 타임을, 스마일 타임으로!',
        type: 'website',
        images: [
          {
            url: 'https://pickteum.com/pickteum_og.png',
            width: 1200,
            height: 630,
            alt: '픽틈',
          },
        ],
        url: 'https://pickteum.com',
        siteName: '픽틈',
        locale: 'ko_KR',
      },
    }
  }
}

// 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    
    if (!code || code.length !== 6) {
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
    
    // 조회수 증가 (에러 무시)
    supabase
      .from('articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)
      .catch(() => {}) // 에러 무시
    
    redirect(`/article/${article.id}`)

  } catch (error) {
    console.error('숏 URL 페이지 오류:', error)
    notFound()
  }
} 