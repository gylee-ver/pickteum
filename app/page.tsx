import Header from "@/components/header"
import ContentFeed from "@/components/content-feed"
import CategoryFilter from "@/components/category-filter"
import Footer from "@/components/footer"
import { CategoryProvider } from "@/contexts/category-context"
import { generateWebsiteSchema, generateOrganizationSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/structured-data"

export default function Home() {
  // 🔥 구조화된 데이터 생성
  const websiteSchema = generateWebsiteSchema()
  const organizationSchema = generateOrganizationSchema()
  const faqSchema = generateFAQSchema()
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "홈", url: "https://www.pickteum.com" }
  ])

  return (
    <>
      {/* 구조화된 데이터 삽입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      <div className="flex min-h-screen flex-col bg-white">
        <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
          <Header />
          <CategoryProvider>
            <main className="flex-grow px-4">
              <CategoryFilter />
              <ContentFeed />
            </main>
          </CategoryProvider>
          <Footer />
        </div>
      </div>
    </>
  )
}
