"use client"

interface ArticleSchemaProps {
  article: {
    id: string
    title: string
    content: string
    summary?: string
    published_at: string
    updated_at: string
    thumbnail_url?: string
    category?: {
      name: string
    }
    author?: string
  }
}

export default function ArticleSchema({ article }: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary || article.content.substring(0, 160).replace(/<[^>]*>/g, ''),
    "image": article.thumbnail_url ? `https://www.pickteum.com${article.thumbnail_url}` : "https://www.pickteum.com/pickteum_og.png",
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "author": {
      "@type": "Organization",
      "name": article.author || "픽틈",
      "url": "https://www.pickteum.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "픽틈",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.pickteum.com/pickteum_favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.pickteum.com/article/${article.id}`
    },
    "articleSection": article.category?.name || "뉴스",
    "inLanguage": "ko-KR",
    "url": `https://www.pickteum.com/article/${article.id}`
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
} 