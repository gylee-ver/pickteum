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
    
    // 명시적 필드 선택으로 확실한 데이터 가져오기
    let query = supabase
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
        category_id,
        category:categories(id, name, color)
      `)
      .eq('status', 'published')
      .single()

    // slug 또는 id로 검색
    const { data: article, error } = await query.or(`slug.eq.${id},id.eq.${id}`)

    console.log('DB 쿼리 결과:', {
      found: !!article,
      error: error?.message,
      thumbnail: article?.thumbnail,
      title: article?.title,
      category: article?.category,
      categoryId: article?.category_id
    })

    if (error || !article) {
      console.log('아티클을 찾을 수 없음:', error?.message)
      return {
        title: '페이지를 찾을 수 없습니다 | 픽틈',
        description: '요청하신 콘텐츠가 존재하지 않거나 삭제되었을 수 있습니다.',
      }
    }

    // 메타데이터 구성
    const title = article.seo_title || article.title
    const description = article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '')
    
    // 이미지 URL 처리 (절대 URL로 통일)
    let imageUrl = 'https://pickteum.com/pickteum_og.png' // 기본값
    
    if (article.thumbnail) {
      if (article.thumbnail.startsWith('http')) {
        imageUrl = article.thumbnail
      } else if (article.thumbnail.startsWith('/')) {
        imageUrl = `https://pickteum.com${article.thumbnail}`
      } else {
        imageUrl = `https://pickteum.com/${article.thumbnail}`
      }
    }

    console.log('최종 이미지 URL:', imageUrl)

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

    console.log('=== generateMetadata 완료 ===')
    return metadata

  } catch (error) {
    console.error('generateMetadata 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 서버 컴포넌트
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // 동일한 쿼리로 아티클 데이터 로딩
    let query = supabase
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
      .eq('status', 'published')
      .single()

    const { data: article, error } = await query.or(`slug.eq.${id},id.eq.${id}`)

    if (error || !article) {
      notFound()
    }

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

    // 구조화된 데이터 (JSON-LD)
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.seo_title || article.title,
      "description": article.seo_description || article.content?.replace(/<[^>]*>/g, '').substring(0, 160),
      "image": [imageUrl],
      "author": {
        "@type": "Person",
        "name": article.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "픽틈",
        "logo": {
          "@type": "ImageObject",
          "url": "https://pickteum.com/pickteum_og.png"
        }
      },
      "datePublished": article.published_at || article.created_at,
      "dateModified": article.updated_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://pickteum.com/article/${id}`
      },
      "url": `https://pickteum.com/article/${id}`,
      "articleSection": article.category?.name || '미분류',
      "keywords": article.tags?.join(', ') || ''
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ArticleClient 
          articleId={article.id} 
          initialArticle={article} 
        />
      </>
    )

  } catch (error) {
    console.error('ArticlePage 오류:', error)
    notFound()
  }
}
