export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "픽틈",
    "alternateName": "Pickteum",
    "url": "https://www.pickteum.com",
    "logo": "https://www.pickteum.com/pickteum_favicon.ico",
    "description": "틈새 시간을, 이슈 충전 타임으로! 픽틈에서 빠르고 정확한 뉴스와 콘텐츠를 만나보세요.",
    "foundingDate": "2024",
    "sameAs": [
      "https://www.pickteum.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://www.pickteum.com/contact"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KR",
      "addressRegion": "서울",
      "addressLocality": "대한민국"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
} 