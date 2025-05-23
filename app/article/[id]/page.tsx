import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import ArticleClient from './article-client'

// 🔥 SEO 최적화: generateMetadata 함수 (서버 컴포넌트에서만 사용 가능)
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    // slug 또는 id로 아티클 찾기
    let { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(
          id,
          name,
          color
        )
      `)
      .eq('slug', params.id)
      .eq('status', 'published')
      .single()

    // slug로 찾지 못했으면 id로 재시도
    if (error || !article) {
      const { data: articleById, error: errorById } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(
            id,
            name,
            color
          )
        `)
        .eq('id', params.id)
        .eq('status', 'published')
        .single()
      
      article = articleById
      error = errorById
    }

    if (error || !article) {
      return {
        title: '페이지를 찾을 수 없습니다 | 픽틈',
        description: '요청하신 콘텐츠가 존재하지 않거나 삭제되었을 수 있습니다.',
      }
    }

    const title = article.seo_title || article.title
    const description = article.seo_description || 
      (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : '')
    const imageUrl = article.thumbnail || '/pickteum_og.png'

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
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `/article/${article.slug}`,
      },
    }
  } catch (error) {
    console.error('메타데이터 생성 오류:', error)
    return {
      title: '오류가 발생했습니다 | 픽틈',
      description: '페이지를 불러오는 중 오류가 발생했습니다.',
    }
  }
}

// 서버 컴포넌트: 초기 데이터 로딩 + 구조화된 데이터 삽입
export default async function ArticlePage({ params }: { params: { id: string } }) {
  try {
    // 아티클 데이터 로딩 (generateMetadata와 동일한 로직)
    let { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(
          id,
          name,
          color
        )
      `)
      .eq('slug', params.id)
      .eq('status', 'published')
      .single()

    if (error || !article) {
      const { data: articleById, error: errorById } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(
            id,
            name,
            color
          )
        `)
        .eq('id', params.id)
        .eq('status', 'published')
        .single()
      
      article = articleById
      error = errorById
    }

    if (error || !article) {
      notFound()
    }

    // 🔥 구조화된 데이터 생성 (Schema.org)
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.seo_title || article.title,
      "description": article.seo_description || article.content?.replace(/<[^>]*>/g, '').substring(0, 160),
      "image": [article.thumbnail || '/pickteum_og.png'],
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
        "@id": `https://pickteum.com/article/${article.slug}`
      },
      "url": `https://pickteum.com/article/${article.slug}`,
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
          "item": `https://pickteum.com/article/${article.slug}`
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
        
        {/* 클라이언트 컴포넌트로 전달 */}
        <ArticleClient initialArticle={article} articleId={params.id} />
      </>
    )
  } catch (error) {
    console.error('아티클 페이지 오류:', error)
    notFound()
  }
}
