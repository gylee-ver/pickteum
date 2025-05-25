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
    
    // 아티클 조회
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
        categories!inner(name, color)
      `)
      .eq('short_code', code)
      .eq('status', 'published')
      .single()
    
    console.log('숏 URL DB 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      thumbnail: article?.thumbnail
    })
    
    if (error || !article) {
      return {
        title: '페이지를 찾을 수 없습니다 | 픽틈',
        description: '요청하신 콘텐츠가 존재하지 않거나 삭제되었을 수 있습니다.',
      }
    }

    const title = article.seo_title || article.title
    const description = article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '')
    
    // 이미지 URL 처리
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

    return {
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
        section: article.categories?.name || '미분류',
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
    }
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
  
  console.log('숏 URL 접근:', code)
  
  if (!code || code.length !== 6) {
    notFound()
  }
  
  // 아티클 조회 및 리다이렉트
  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, views')
    .eq('short_code', code)
    .eq('status', 'published')
    .single()
  
  if (error || !article) {
    notFound()
  }
  
  // 조회수 증가 (비동기)
  supabase
    .from('articles')
    .update({ views: (article.views || 0) + 1 })
    .eq('id', article.id)
    .then(() => console.log('조회수 증가 성공'))
    .catch(err => console.error('조회수 증가 실패:', err))

  // 리다이렉트
  redirect(`/article/${article.id}`)
} 