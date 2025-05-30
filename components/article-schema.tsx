"use client"

import { extractKeywords } from '@/lib/social-meta'

interface ArticleSchemaProps {
  article: {
    id: string
    title: string
    content: string
    seo_description?: string
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
  // 🔥 키워드 추출
  const keywords = extractKeywords(
    article.title,
    article.content,
    article.category?.name
  )
  
  // 🔥 콘텐츠 요약 생성
  const plainTextContent = article.content.replace(/<[^>]*>/g, '').trim()
  const readingTime = Math.max(1, Math.ceil(plainTextContent.length / 200))
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.seo_description || plainTextContent.substring(0, 160),
    "image": [
      article.thumbnail_url ? 
        (article.thumbnail_url.startsWith('http') ? 
          article.thumbnail_url : 
          `https://www.pickteum.com${article.thumbnail_url}`) : 
        "https://www.pickteum.com/pickteum_og.png"
    ],
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
    "url": `https://www.pickteum.com/article/${article.id}`,
    "wordCount": plainTextContent.length,
    "timeRequired": `PT${readingTime}M`,
    // 🔥 SEO 향상을 위한 추가 요소들
    "keywords": keywords.join(', '),
    "about": [
      {
        "@type": "Thing",
        "name": article.category?.name || "뉴스"
      }
    ],
    "isPartOf": {
      "@type": "WebSite",
      "name": "픽틈",
      "url": "https://www.pickteum.com",
      "description": "틈새 시간을, 이슈 충전 타임으로!"
    },
    "potentialAction": {
      "@type": "ReadAction",
      "target": `https://www.pickteum.com/article/${article.id}`
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
} 