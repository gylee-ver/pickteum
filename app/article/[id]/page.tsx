import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'

// 강제 동적 렌더링
export const dynamic = 'force-dynamic'

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    
    console.log('=== generateMetadata 시작 ===', id)
    
    // 가장 안전한 쿼리 (조인 없이)
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
        slug,
        published_at,
        created_at,
        updated_at,
        category_id
      `)
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq('status', 'published')
      .single()

    console.log('generateMetadata 1차 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      articleId: article?.id,
      title: article?.title?.substring(0, 50),
      thumbnail: article?.thumbnail
    })

    if (error || !article) {
      console.log('아티클을 찾을 수 없음:', error?.message)
      // 에러시에도 기본 메타데이터 반환
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

    // 카테고리 정보 별도 조회 (실패해도 계속 진행)
    let categoryName = '미분류'
    try {
      if (article.category_id) {
        const { data: category } = await supabase
          .from('categories')
          .select('name')
          .eq('id', article.category_id)
          .single()
        
        if (category) {
          categoryName = category.name
        }
      }
    } catch (catError) {
      console.log('카테고리 조회 실패 (무시):', catError)
    }

    // 안전한 메타데이터 구성
    const title = (article.seo_title || article.title || '픽틈').trim()
    const description = (article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '') ||
      '픽틈에서 제공하는 유익한 콘텐츠입니다.').trim()
    
    // 안전한 이미지 URL 처리
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
      console.log('이미지 URL 처리 오류 (기본값 사용):', imgError)
    }

    console.log('generateMetadata 처리된 데이터:', {
      title: title.substring(0, 50),
      description: description.substring(0, 50),
      imageUrl,
      categoryName
    })

    const metadata: Metadata = {
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
        section: categoryName,
        tags: Array.isArray(article.tags) ? article.tags : [],
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        url: `https://pickteum.com/article/${id}`,
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
        canonical: `https://pickteum.com/article/${article.slug || id}`,
      },
    }

    console.log('=== generateMetadata 성공 완료 ===')
    return metadata

  } catch (error) {
    console.error('generateMetadata 치명적 오류:', error)
    
    // 치명적 오류시에도 기본 메타데이터 반환 (절대 실패하지 않음)
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

// 서버 컴포넌트 (기존과 동일하지만 에러 처리 강화)
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // 안전한 아티클 데이터 로딩
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
        slug,
        published_at,
        created_at,
        updated_at,
        views,
        category_id,
        category:categories(id, name, color)
      `)
      .or(`slug.eq.${id},id.eq.${id}`)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      console.log('ArticlePage: 아티클을 찾을 수 없음:', error?.message)
      notFound()
    }

    return (
      <ArticleClient 
        articleId={article.id} 
        initialArticle={article} 
      />
    )

  } catch (error) {
    console.error('ArticlePage 오류:', error)
    notFound()
  }
}
