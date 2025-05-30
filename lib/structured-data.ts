// 구조화된 데이터 생성 유틸리티 함수들

export interface Article {
  id: string
  title: string
  content: string
  author: string
  slug: string
  thumbnail?: string
  seo_title?: string
  seo_description?: string
  published_at?: string
  created_at: string
  updated_at: string
  tags?: string[]
  category?: {
    id: string
    name: string
    color: string
  }
}

export interface Category {
  id: string
  name: string
  color: string
  description?: string
}

// 🔥 웹사이트 스키마 생성
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "픽틈",
    "alternateName": "Pickteum",
    "url": "https://www.pickteum.com",
    "description": "틈새 시간을, 이슈 충전 타임으로!",
    "inLanguage": "ko-KR",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.pickteum.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "픽틈",
      "url": "https://www.pickteum.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.pickteum.com/pickteum_og.png",
        "width": 1200,
        "height": 630
      }
    }
  }
}

// 🔥 조직 스키마 생성
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "픽틈",
    "alternateName": "Pickteum",
    "url": "https://www.pickteum.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.pickteum.com/pickteum_og.png",
      "width": 1200,
      "height": 630
    },
    "description": "틈새 시간을, 이슈 충전 타임으로! 건강, 스포츠, 정치/시사, 경제, 라이프, 테크 등 다양한 콘텐츠를 제공합니다.",
    "foundingDate": "2025",
    "slogan": "틈새 시간을, 이슈 충전 타임으로!",
    "knowsAbout": [
      "뉴스",
      "건강",
      "스포츠", 
      "정치",
      "시사",
      "경제",
      "라이프스타일",
      "기술"
    ],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.pickteum.com"
    }
  }
}

// 🔥 아티클 스키마 생성 (기존 함수 개선)
export function generateArticleSchema(article: Article) {
  // 이미지 URL을 절대경로로 변환
  let imageUrl = 'https://www.pickteum.com/pickteum_og.png'
  if (article.thumbnail) {
    if (article.thumbnail.startsWith('http')) {
      imageUrl = article.thumbnail
    } else if (article.thumbnail.startsWith('/')) {
      imageUrl = `https://www.pickteum.com${article.thumbnail}`
    } else {
      imageUrl = `https://www.pickteum.com/${article.thumbnail}`
    }
  }

  // keywords를 250자로 제한
  const keywords = article.tags?.join(', ') || ''
  const limitedKeywords = keywords.length > 250 ? 
    keywords.substring(0, 247) + '...' : keywords

  return {
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
        "url": "https://www.pickteum.com/pickteum_og.png"
      }
    },
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.pickteum.com/article/${article.slug}`
    },
    "url": `https://www.pickteum.com/article/${article.slug}`,
    "articleSection": article.category?.name || '미분류',
    "keywords": limitedKeywords,
    "wordCount": article.content ? article.content.replace(/<[^>]*>/g, '').length : 0,
    "genre": ["뉴스", "정보"],
    "about": {
      "@type": "Thing",
      "name": article.category?.name || '미분류'
    }
  }
}

// 🔥 카테고리 컬렉션 스키마 생성
export function generateCategoryCollectionSchema(category: Category, articles: Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} - 픽틈`,
    "description": `픽틈의 ${category.name} 카테고리 콘텐츠 모음`,
    "url": `https://www.pickteum.com/category/${category.name.toLowerCase()}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${category.name} 아티클 목록`,
      "numberOfItems": articles.length,
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          "url": `https://www.pickteum.com/article/${article.slug}`,
          "image": article.thumbnail || '/pickteum_og.png',
          "datePublished": article.published_at || article.created_at,
          "author": {
            "@type": "Person",
            "name": article.author
          }
        }
      }))
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "픽틈",
      "url": "https://www.pickteum.com"
    }
  }
}

// 🔥 빵부스러기 스키마 생성
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

// 🔥 FAQ 스키마 생성
export function generateFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "픽틈이란 무엇인가요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "픽틈은 '틈새 시간을, 이슈 충전 타임으로!'를 슬로건으로 하는 콘텐츠 플랫폼입니다. 건강, 스포츠, 정치/시사, 경제, 라이프, 테크 등 다양한 분야의 유익한 콘텐츠를 제공합니다."
        }
      },
      {
        "@type": "Question",
        "name": "어떤 카테고리의 콘텐츠를 제공하나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "건강, 스포츠, 정치/시사, 경제, 라이프, 테크 등 6개 주요 카테고리의 콘텐츠를 제공합니다. 각 카테고리마다 전문성 있는 양질의 콘텐츠를 선별하여 제공합니다."
        }
      },
      {
        "@type": "Question",
        "name": "콘텐츠는 얼마나 자주 업데이트되나요?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "픽틈은 매일 새로운 콘텐츠를 업데이트합니다. 최신 트렌드와 유용한 정보를 신속하게 전달하기 위해 지속적으로 콘텐츠를 갱신하고 있습니다."
        }
      }
    ]
  }
}

// 🔥 사이트맵 아이템리스트 스키마 생성
export function generateSitemapSchema(articles: Article[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "픽틈 전체 콘텐츠 목록",
    "description": "픽틈에서 제공하는 모든 콘텐츠의 목록입니다.",
    "numberOfItems": articles.length,
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "NewsArticle",
        "headline": article.title,
        "url": `https://www.pickteum.com/article/${article.slug}`,
        "image": article.thumbnail || '/pickteum_og.png',
        "datePublished": article.published_at || article.created_at,
        "author": {
          "@type": "Person",
          "name": article.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "픽틈"
        }
      }
    }))
  }
} 