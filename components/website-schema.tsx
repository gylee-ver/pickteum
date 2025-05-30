export default function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "픽틈",
    "alternateName": "Pickteum",
    "url": "https://www.pickteum.com",
    "description": "틈새 시간을, 이슈 충전 타임으로! 건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 뉴스와 콘텐츠를 제공합니다.",
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
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.pickteum.com/pickteum_favicon.ico"
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
} 