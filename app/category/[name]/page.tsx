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

// 🔥 SEO 강화된 카테고리별 메타데이터 생성
export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const categoryName = decodeURIComponent(params.name)
  
  // 카테고리 존재 여부와 아티클 수 확인
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('name', categoryName)
    .single()

  if (categoryError || !category) {
    return {
      title: '카테고리를 찾을 수 없습니다',
      description: '요청하신 카테고리를 찾을 수 없습니다.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // 해당 카테고리의 아티클 수와 최신 아티클 확인
  const [{ count }, { data: latestArticles }] = await Promise.all([
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', 'published'),
    supabase
      .from('articles')
      .select('title')
      .eq('category_id', category.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)
  ])

  const hasArticles = (count || 0) > 0
  const articleCount = count || 0
  
  // 🔥 SEO 최적화된 메타 설명 생성
  const baseDescription = `틈새 시간을, 이슈 충전 타임으로! 픽틈의 ${categoryName} 카테고리`
  const enhancedDescription = hasArticles 
    ? `${baseDescription}에서 ${articleCount}개의 최신 콘텐츠를 확인하세요. ${latestArticles?.slice(0, 2).map(a => a.title).join(', ')} 등 다양한 정보를 제공합니다.`
    : `${baseDescription} 콘텐츠를 확인해보세요.`

  return {
    title: `${categoryName} - 픽틈`,
    description: enhancedDescription.length > 160 ? enhancedDescription.substring(0, 157) + '...' : enhancedDescription,
    keywords: [categoryName, '픽틈', '뉴스', '이슈', '정보', ...(latestArticles?.slice(0, 3).map(a => a.title.split(' ')[0]) || [])].join(', '),
    alternates: {
      canonical: `https://www.pickteum.com/category/${encodeURIComponent(categoryName.toLowerCase())}`,
    },
    robots: hasArticles ? {
      index: true,
      follow: true,
    } : {
      index: false,
      follow: true,
    },
    openGraph: {
      title: `${categoryName} - 틈 날 땐? 픽틈!`,
      description: enhancedDescription,
      type: 'website',
      url: `https://www.pickteum.com/category/${encodeURIComponent(categoryName.toLowerCase())}`,
      siteName: '픽틈',
      images: [
        {
          url: 'https://www.pickteum.com/pickteum_og.png',
          width: 1200,
          height: 630,
          alt: `${categoryName} - 픽틈`,
        },
      ],
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} - 틈 날 땐? 픽틈!`,
      description: enhancedDescription,
      images: ['https://www.pickteum.com/pickteum_og.png'],
      creator: '@pickteum',
      site: '@pickteum',
    },
    other: {
      'article:section': categoryName,
      'content:type': 'category'
    }
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
              {/* 🔥 SEO 최적화된 카테고리 헤더 */}
              <header className="mb-6">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: category.color }}
                    role="presentation"
                    aria-label={`${categoryName} 카테고리 색상`}
                  />
                  <h1 className="text-2xl font-bold text-[#212121]">{categoryName}</h1>
                </div>
                <p className="text-[#767676]" role="contentinfo">
                  {categoryName} 카테고리의 최신 콘텐츠 {formattedArticles.length}개
                </p>
                {/* 🔥 추가 SEO 정보 */}
                <div className="sr-only">
                  <span>픽틈의 {categoryName} 카테고리 페이지입니다. 총 {formattedArticles.length}개의 아티클이 있습니다.</span>
                </div>
              </header>

              {/* 🔥 SEO 최적화된 아티클 목록 */}
              {formattedArticles.length > 0 ? (
                <section aria-label={`${categoryName} 카테고리 아티클 목록`}>
                  <h2 className="sr-only">아티클 목록</h2>
                  <div className="grid grid-cols-1 gap-4" role="list">
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
                </section>
              ) : (
                <section className="text-center py-12" role="status" aria-label="빈 카테고리 알림">
                  <h2 className="text-lg font-semibold text-[#212121] mb-2">아직 콘텐츠가 없습니다</h2>
                  <p className="text-[#767676]">
                    {categoryName} 카테고리에 새로운 콘텐츠가 곧 업데이트될 예정입니다.
                  </p>
                </section>
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