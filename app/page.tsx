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
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔥 캐시 무효화 설정 - 메인 페이지는 항상 최신 데이터 표시
export const revalidate = 0 // 캐시 비활성화
export const dynamic = 'force-dynamic' // 항상 동적 렌더링

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.pickteum.com',
  },
}

export default async function Home() {
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
              <ContentFeed initialArticles={formattedArticles} />
            </main>
          </CategoryProvider>
          <Footer />
        </div>
      </div>
    </>
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 🔥 AdSense 호환성을 위한 응답 헤더 설정
  const response = NextResponse.next()
  
  // 🔥 Google AdSense iframe 허용을 위한 CSP 설정
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com;"
  )
  
  // 🔥 X-Frame-Options 헤더 제거
  response.headers.delete('X-Frame-Options')
  
  // ... 기존 리다이렉트 로직 유지 ...
  
  return response
}

// 🔥 모든 페이지에 헤더 적용
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
