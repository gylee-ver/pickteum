import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import Header from "@/components/header"
import ContentCard from "@/components/content-card"
import Footer from "@/components/footer"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const POSTS_PER_PAGE = 20

// 페이지네이션 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page: pageParam } = await params
  const page = parseInt(pageParam) || 1
  
  if (page < 1) {
    notFound()
  }
  
  // 🔥 전체 아티클 수 확인하여 빈 페이지 방지
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)
  const hasContent = page <= totalPages && (count || 0) > 0
  
  const baseTitle = '픽틈 - 틈새시간을 이슈충전 타임으로'
  const title = page === 1 ? baseTitle : `${baseTitle} | ${page}페이지`
  
  return {
    title,
    description: `픽틈의 최신 뉴스와 콘텐츠 ${page}페이지입니다. 건강, 스포츠, 경제, 정치, 라이프, 테크 등 다양한 분야의 정보를 확인해보세요.`,
    alternates: {
      canonical: `https://www.pickteum.com/page/${page}`,
      ...(page > 1 && { prev: `https://www.pickteum.com/page/${page - 1}` }),
      ...(page < totalPages && { next: `https://www.pickteum.com/page/${page + 1}` })
    },
    // 🔥 콘텐츠가 없는 페이지는 색인하지 않음 (SEO 품질 개선)
    robots: {
      index: hasContent, // 실제 콘텐츠가 있을 때만 색인 허용
      follow: true,
    },
    openGraph: {
      title,
      description: `픽틈의 최신 뉴스와 콘텐츠 ${page}페이지입니다.`,
      type: 'website',
    },
  }
}

export default async function PaginatedPage({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageParam } = await params
  const page = parseInt(pageParam) || 1
  
  if (page < 1) {
    notFound()
  }
  
  const offset = (page - 1) * POSTS_PER_PAGE
  
  // 아티클 데이터 조회
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      thumbnail,
      published_at,
      created_at,
      slug,
      category:categories(name, color)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + POSTS_PER_PAGE - 1)

  if (error) {
    console.error('아티클 조회 오류:', error)
    notFound()
  }

  // 전체 아티클 수 조회 (페이지네이션용)
  const { count } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  const totalPages = Math.ceil((count || 0) / POSTS_PER_PAGE)
  
  if (page > totalPages && totalPages > 0) {
    notFound()
  }

  // 데이터 포맷팅
  const formattedArticles = articles?.map(article => {
    // category가 배열일 수 있으므로 안전하게 접근
    const categoryData = Array.isArray(article.category) 
      ? article.category[0] 
      : article.category;
      
    return {
      id: article.slug || article.id,
      title: article.title,
      category: categoryData || { name: '미분류', color: '#cccccc' },
      thumbnail: article.thumbnail || '/placeholder.jpg',
      date: format(
        new Date(article.published_at || article.created_at),
        'yyyy.MM.dd',
        { locale: ko }
      ),
    };
  }) || []

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#212121] mb-2">
              픽틈 - {page}페이지
            </h1>
            <p className="text-[#767676]">
              총 {count?.toLocaleString() || 0}개의 콘텐츠 중 {((page - 1) * POSTS_PER_PAGE + 1).toLocaleString()}-{Math.min(page * POSTS_PER_PAGE, count || 0).toLocaleString()}번째
            </p>
          </div>

          {/* 아티클 목록 */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {formattedArticles.map((article, index) => (
              <ContentCard
                key={article.id}
                {...article}
                priority={page === 1 && index < 3} // 첫 페이지 상위 3개만 priority
              />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <nav aria-label="페이지 네비게이션" className="flex justify-center items-center space-x-2">
              {/* 이전 페이지 */}
              {page > 1 && (
                <Link 
                  href={page === 2 ? "/" : `/page/${page - 1}`}
                  className="flex items-center px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  이전
                </Link>
              )}

              {/* 페이지 번호들 */}
              <div className="flex space-x-1">
                {/* 첫 페이지 */}
                {page > 3 && (
                  <>
                    <Link
                      href="/"
                      className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      1
                    </Link>
                    {page > 4 && <span className="px-2 py-2 text-sm text-gray-500">...</span>}
                  </>
                )}

                {/* 현재 페이지 주변 */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  if (pageNum < 1 || pageNum > totalPages) return null

                  return (
                    <Link
                      key={pageNum}
                      href={pageNum === 1 ? "/" : `/page/${pageNum}`}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                        pageNum === page
                          ? 'bg-[#FFC83D] text-black border-[#FFC83D]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}

                {/* 마지막 페이지 */}
                {page < totalPages - 2 && (
                  <>
                    {page < totalPages - 3 && <span className="px-2 py-2 text-sm text-gray-500">...</span>}
                    <Link
                      href={`/page/${totalPages}`}
                      className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {totalPages}
                    </Link>
                  </>
                )}
              </div>

              {/* 다음 페이지 */}
              {page < totalPages && (
                <Link 
                  href={`/page/${page + 1}`}
                  className="flex items-center px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  다음
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              )}
            </nav>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
} 