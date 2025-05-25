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
    
    // LEFT JOIN 사용으로 카테고리가 없어도 아티클 조회 가능
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
        category_id,
        category:categories(name, color)
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('숏 URL DB 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      articleId: article?.id,
      title: article?.title,
      thumbnail: article?.thumbnail,
      category: article?.category,
      categoryId: article?.category_id
    })
    
    if (error || !article) {
      console.log('숏 URL 아티클을 찾을 수 없음:', error?.message)
      return {
        title: '페이지를 찾을 수 없습니다 | 픽틈',
        description: '요청하신 콘텐츠가 존재하지 않거나 삭제되었을 수 있습니다.',
      }
    }

    const title = article.seo_title || article.title
    const description = article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '')
    
    // 이미지 URL 처리 (절대 URL로 통일)
    let imageUrl = 'https://pickteum.com/pickteum_og.png'
    if (article.thumbnail) {
      if (article.thumbnail.startsWith('http')) {
        imageUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        imageUrl = `https://pickteum.com${article.thumbnail}`
      } else {
        imageUrl = `https://pickteum.com/${article.thumbnail}`
      }
    }

    console.log('숏 URL 최종 이미지 URL:', imageUrl)

    const metadata: Metadata = {
      title: `${title} | 픽틈`,
      description,
      keywords: article.tags?.join(', ') || '',
      authors: [{ name: article.author }],
      openGraph: {
        title: title,
        description: description,
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: [article.author],
        section: article.category?.name || '미분류',
        tags: article.tags || [],
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

    console.log('=== 숏 URL generateMetadata 완료 ===', {
      title: metadata.title,
      ogTitle: metadata.openGraph?.title,
      ogImage: metadata.openGraph?.images?.[0]
    })

    return metadata

  } catch (error) {
    console.error('숏 URL generateMetadata 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 페이지 컴포넌트
export default async function ShortCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  console.log('숏 URL 페이지 접근:', code)
  
  if (!code || code.length !== 6) {
    console.log('잘못된 코드 형식:', code)
    notFound()
  }
  
  // 간단한 쿼리로 아티클 존재 확인
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, views')
    .eq('short_code', code)
    .eq('status', 'published')
    .single()
  
  console.log('숏 URL 아티클 확인:', { found: !!article, error: error?.message })
  
  if (error || !article) {
    console.log('숏 URL 아티클을 찾을 수 없음:', code)
    notFound()
  }
  
  // 조회수 증가 (비동기, 에러 무시)
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .then(() => console.log('조회수 증가 성공'))
    .catch(err => console.error('조회수 증가 실패:', err))

  console.log('숏 URL 리다이렉트:', `/article/${article.id}`)
  
  // 리다이렉트
  redirect(`/article/${article.id}`)
} 