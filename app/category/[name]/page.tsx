import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import supabase from "@/lib/supabase"
import Header from "@/components/header"
import ContentCard from "@/components/content-card"
import Footer from "@/components/footer"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { generateCategoryCollectionSchema, generateBreadcrumbSchema } from '@/lib/structured-data'
import PickteumTracker from '@/components/analytics/pickteum-tracker'

// 카테고리별 메타데이터 생성
export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const categoryName = decodeURIComponent(params.name)
  
  return {
    title: `${categoryName}`,
    description: `틈새 시간을, 이슈 충전 타임으로! 픽틈의 ${categoryName} 카테고리 콘텐츠를 확인해보세요.`,
    openGraph: {
      title: `${categoryName} - 틈 날 땐? 픽틈!`,
      description: `틈새 시간을, 이슈 충전 타임으로! 픽틈의 ${categoryName} 카테고리 콘텐츠를 확인해보세요.`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: { params: { name: string } }) {
  const categoryName = decodeURIComponent(params.name)
  
  try {
    // 카테고리 정보 조회
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', categoryName)
      .single()

    if (categoryError || !category) {
      notFound()
    }

    // 해당 카테고리의 아티클 조회
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        *,
        category:categories(
          id,
          name,
          color
        )
      `)
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20)

    if (articlesError) {
      notFound()
    }

    // 아티클 데이터 포맷팅
    const formattedArticles = articles?.map(article => ({
      id: article.id,
      title: article.title,
      category: {
        name: article.category?.name || categoryName,
        color: article.category?.color || category.color
      },
      thumbnail: article.thumbnail || '/placeholder.svg',
      date: article.published_at ? 
        format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
        format(new Date(article.created_at), 'yyyy.MM.dd', { locale: ko }),
      slug: article.slug
    })) || []

    // 🔥 구조화된 데이터 생성
    const categoryCollectionSchema = generateCategoryCollectionSchema(category, articles || [])
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "홈", url: "https://www.pickteum.com" },
      { name: categoryName, url: `https://www.pickteum.com/category/${categoryName.toLowerCase()}` }
    ])

    return (
      <>
        {/* 구조화된 데이터 삽입 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(categoryCollectionSchema)
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
            {/* 픽틈 추적 컴포넌트 추가 */}
            <PickteumTracker categoryName={categoryName} />
            
            <Header />
            
            <main className="flex-grow px-4 py-6">
              {/* 카테고리 헤더 */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                  />
                  <h1 className="text-2xl font-bold text-[#212121]">{categoryName}</h1>
                </div>
                <p className="text-[#767676]">
                  {categoryName} 카테고리의 최신 콘텐츠 {formattedArticles.length}개
                </p>
              </div>

              {/* 아티클 목록 */}
              <div className="grid grid-cols-1 gap-4">
                {formattedArticles.map((article) => (
                  <ContentCard
                    key={article.id}
                    id={article.slug}
                    title={article.title}
                    category={article.category}
                    thumbnail={article.thumbnail}
                    date={article.date}
                  />
                ))}
              </div>

              {formattedArticles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#767676]">아직 이 카테고리에 콘텐츠가 없습니다.</p>
                </div>
              )}
            </main>

            <Footer />
          </div>
        </div>
      </>
    )

  } catch (error) {
    notFound()
  }
} 