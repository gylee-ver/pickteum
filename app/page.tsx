import Header from "@/components/header"
import ContentFeed from "@/components/content-feed"
import CategoryFilter from "@/components/category-filter"
import Footer from "@/components/footer"
import { CategoryProvider } from "@/contexts/category-context"
import { generateWebsiteSchema, generateOrganizationSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/structured-data"
import { Metadata } from 'next'
import supabase from "@/lib/supabase"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getImageUrl } from "@/lib/utils"
import StaticFeed from "@/components/static-feed"
import { headers } from 'next/headers'

// 🔥 ISR 설정 - 5분마다 페이지 재검증 (성능 최적화)
export const revalidate = 300 // 5분마다 재검증

// 🔥 애드센스 호환성: 봇인 경우 정적 렌더링 허용, 일반 사용자는 동적 렌더링
export const dynamic = 'auto' // 자동 렌더링 선택

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.pickteum.com',
  },
}

export default async function Home() {
  // 🔥 애드센스 호환성: User-Agent 확인
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isAdSenseBot = userAgent.includes('Mediapartners-Google') || 
                       userAgent.includes('AdsBot-Google') || 
                       userAgent.includes('Googlebot')

  // 🔥 서버 사이드에서 초기 아티클 데이터 가져오기 (애드센스 승인용)
  const { data: articles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      thumbnail,
      published_at,
      created_at,
      category_id,
      slug,
      categories!inner(name, color)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  // 데이터 포맷팅
  const formattedArticles = articles?.map(article => ({
    id: article.slug || article.id,
    title: article.title,
    category: {
      name: (article as any).categories?.name || '미분류',
      color: (article as any).categories?.color || '#cccccc'
    },
    thumbnail: getImageUrl(article.thumbnail),
    date: article.published_at
      ? format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko })
      : format(new Date(), 'yyyy.MM.dd', { locale: ko }),
    publishedAt: article.published_at
  })) || []

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
              {/* 🔥 애드센스 호환성: 봇일 때는 정적 피드만, 사용자일 때는 동적 피드 추가 */}
              <StaticFeed articles={formattedArticles} />
              {!isAdSenseBot && (
                <ContentFeed initialArticles={formattedArticles} />
              )}
            </main>
          </CategoryProvider>
          <Footer />
        </div>
      </div>
    </>
  )
}
