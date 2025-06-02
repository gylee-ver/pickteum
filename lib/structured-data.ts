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

// 🔥 카테고리별 FAQ 스키마 생성 (새로 추가)
export function generateCategoryFAQSchema(categoryName: string) {
  const faqData: { [key: string]: Array<{question: string, answer: string}> } = {
    '건강': [
      {
        question: `건강 카테고리에서는 어떤 콘텐츠를 볼 수 있나요?`,
        answer: `건강 카테고리에서는 최신 의학 정보, 영양 가이드, 운동법, 질병 예방법 등 건강한 삶을 위한 모든 정보를 제공합니다. 전문의의 조언과 검증된 건강 정보로 여러분의 웰빙 라이프를 지원합니다.`
      },
      {
        question: `건강 정보의 신뢰성은 어떻게 보장하나요?`,
        answer: `픽틈의 건강 정보는 의료 전문가의 검토를 거친 신뢰할 수 있는 자료를 바탕으로 제작됩니다. 최신 의학 연구 결과와 공신력 있는 의료기관의 정보를 참고하여 정확한 정보를 제공합니다.`
      }
    ],
    '스포츠': [
      {
        question: `스포츠 카테고리에서는 어떤 종목을 다루나요?`,
        answer: `스포츠 카테고리에서는 프로야구, 축구, 농구, 배구 등 국내외 주요 스포츠 종목의 경기 결과, 선수 소식, 팀 분석 등을 다룹니다. 올림픽, 월드컵 등 국제 대회 소식도 빠짐없이 전달합니다.`
      },
      {
        question: `스포츠 경기 결과는 얼마나 빠르게 업데이트되나요?`,
        answer: `주요 스포츠 경기 결과는 경기 종료 후 최대한 빠른 시간 내에 업데이트됩니다. 실시간 스코어와 주요 장면 분석을 통해 스포츠 팬들에게 생생한 정보를 제공합니다.`
      }
    ],
    '정치/시사': [
      {
        question: `정치/시사 카테고리의 보도 원칙은 무엇인가요?`,
        answer: `정치/시사 카테고리는 객관성과 균형성을 바탕으로 한 정보 전달을 원칙으로 합니다. 다양한 관점을 소개하고 사실에 근거한 분석을 통해 시민들의 알 권리를 충족시킵니다.`
      }
    ],
    '경제': [
      {
        question: `경제 카테고리에서는 어떤 정보를 제공하나요?`,
        answer: `경제 카테고리에서는 주식시장 동향, 부동산 정보, 금융 정책, 기업 뉴스 등 경제 전반의 정보를 제공합니다. 개인 재테크부터 거시경제까지 폭넓은 경제 정보를 다룹니다.`
      }
    ],
    '라이프': [
      {
        question: `라이프 카테고리에서는 어떤 내용을 다루나요?`,
        answer: `라이프 카테고리에서는 일상 생활의 팁, 문화 트렌드, 여행 정보, 음식, 패션, 취미 등 삶의 질을 높이는 다양한 라이프스타일 정보를 제공합니다.`
      }
    ],
    '테크': [
      {
        question: `테크 카테고리에서는 어떤 기술 정보를 다루나요?`,
        answer: `테크 카테고리에서는 최신 기술 동향, IT 뉴스, 스마트폰, 컴퓨터, 인공지능, 블록체인 등 기술 관련 모든 정보를 다룹니다. 빠르게 변화하는 디지털 세상의 트렌드를 놓치지 않도록 도와드립니다.`
      }
    ]
  }

  const categoryFAQ = faqData[categoryName] || [
    {
      question: `${categoryName} 카테고리에서는 어떤 콘텐츠를 볼 수 있나요?`,
      answer: `${categoryName} 카테고리에서는 관련 분야의 최신 정보와 유용한 콘텐츠를 제공합니다. 정확하고 신뢰할 수 있는 정보로 여러분의 지식 충전을 도와드립니다.`
    }
  ]

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": categoryFAQ.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// 🔥 뉴스 아티클 스키마 강화 (기존 함수 개선)
export function generateNewsArticleSchema(article: Article) {
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

  // 읽기 시간 계산
  const plainTextContent = article.content?.replace(/<[^>]*>/g, '') || ''
  const readingTimeMinutes = Math.max(1, Math.ceil(plainTextContent.length / 200))

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.seo_title || article.title,
    "description": article.seo_description || plainTextContent.substring(0, 160),
    "image": [imageUrl],
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": "https://www.pickteum.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "픽틈",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.pickteum.com/pickteum_og.png",
        "width": 1200,
        "height": 630
      },
      "url": "https://www.pickteum.com"
    },
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.pickteum.com/article/${article.slug || article.id}`
    },
    "url": `https://www.pickteum.com/article/${article.slug || article.id}`,
    "articleSection": article.category?.name || '뉴스',
    "keywords": article.tags?.join(', ') || '',
    "wordCount": plainTextContent.length,
    "timeRequired": `PT${readingTimeMinutes}M`,
    "genre": ["뉴스", "정보"],
    "about": {
      "@type": "Thing",
      "name": article.category?.name || '뉴스'
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "픽틈",
      "url": "https://www.pickteum.com"
    },
    // 🔥 뉴스 특화 속성 추가
    "inLanguage": "ko-KR",
    "copyrightHolder": {
      "@type": "Organization",
      "name": "픽틈"
    },
    "copyrightYear": new Date(article.created_at).getFullYear(),
    "creativeWorkStatus": "Published"
  }
} 