import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'

// SEO 최적화: generateMetadata 함수
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params // Next.js 15 호환성
    
    console.log('아티클 generateMetadata 호출, id:', id)
    
    // slug 또는 id로 아티클 찾기
    let { data: article, error } = await supabase
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
        status,
        views,
        category_id,
        category:categories(
          id,
          name,
          color
        )
      `)
      .eq('slug', id)
      .eq('status', 'published')
      .single()

    // slug로 찾지 못했으면 id로 재시도
    if (error || !article) {
      const { data: articleById, error: errorById } = await supabase
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
          status,
          views,
          category_id,
          category:categories(
            id,
            name,
            color
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single()
      
      article = articleById
      error = errorById
    }

    console.log('아티클 generateMetadata DB 결과:', { 
      found: !!article, 
      error: error?.message,
      thumbnail: article?.thumbnail,
      title: article?.title 
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
    
    // 절대 URL로 이미지 경로 생성
    const extractImageFromContent = (content: string): string | null => {
      try {
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
        return imgMatch ? imgMatch[1] : null
      } catch {
        return null
      }
    }

    // 이미지 URL 결정 로직 개선
    const imageUrl = (() => {
      // 1. 썸네일이 있으면 사용
      if (article.thumbnail) {
        return article.thumbnail.startsWith('http') 
          ? article.thumbnail 
          : `https://pickteum.com${article.thumbnail}`
      }
      
      // 2. 콘텐츠에서 첫 번째 이미지 추출
      const contentImage = extractImageFromContent(article.content || '')
      if (contentImage) {
        return contentImage.startsWith('http') 
          ? contentImage 
          : `https://pickteum.com${contentImage}`
      }
      
      // 3. 기본 이미지 사용
      return 'https://pickteum.com/pickteum_og.png'
    })()

    console.log('생성된 OG 이미지 URL:', imageUrl) // 디버깅용 로그 추가

    return {
      title: `${title} | 픽틈`,
      description,
      keywords: article.tags?.join(', ') || '',
      authors: [{ name: article.author }],
      openGraph: {
        title,
        description,
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
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@pickteum',
        site: '@pickteum',
      },
      alternates: {
        canonical: `https://pickteum.com/article/${article.slug || id}`,
      },
      other: {
        // 카카오톡 등 한국 소셜 미디어 최적화
        'og:locale': 'ko_KR',
        'article:author': article.author,
        'article:section': article.category?.name || '미분류',
        'article:published_time': article.published_at || article.created_at,
        'article:modified_time': article.updated_at,
      }
    }
  } catch (error) {
    console.error('아티클 메타데이터 생성 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 서버 컴포넌트: 초기 데이터 로딩 + 구조화된 데이터 삽입
export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params // Next.js 15 호환성
    
    // 아티클 데이터 로딩 (generateMetadata와 동일한 로직)
    let { data: article, error } = await supabase
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
        status,
        views,
        category_id,
        category:categories(
          id,
          name,
          color
        )
      `)
      .eq('slug', id)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      const { data: articleById, error: errorById } = await supabase
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
          status,
          views,
          category_id,
          category:categories(
            id,
            name,
            color
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single()
      
      article = articleById
      error = errorById
    }

    if (error || !article) {
      notFound()
    }

    // 절대 URL로 이미지 경로 생성
    const imageUrl = article.thumbnail 
      ? (article.thumbnail.startsWith('http') ? article.thumbnail : `https://pickteum.com${article.thumbnail}`)
      : 'https://pickteum.com/pickteum_og.png'

    // 구조화된 데이터 생성 (Schema.org)
    const articleSchema = {
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

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": "https://pickteum.com"
        },
        {
          "@type": "ListItem", 
          "position": 2,
          "name": article.category?.name || '미분류',
          "item": `https://pickteum.com/category/${(article.category?.name || '미분류').toLowerCase()}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": article.title,
          "item": `https://pickteum.com/article/${id}`
        }
      ]
    }

    return (
      <>
        {/* 구조화된 데이터 삽입 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />

        {/* 클라이언트 컴포넌트에 아티클 데이터 전달 */}
        <ArticleClient articleId={id} initialArticle={article} />
      </>
    )
  } catch (error) {
    console.error('아티클 페이지 오류:', error)
    notFound()
  }
}
