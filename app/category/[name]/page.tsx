import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticles, getCategories } from "@/lib/data"
import Header from "@/components/header"
import ContentCard from "@/components/content-card"
import Footer from "@/components/footer"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { generateCategoryCollectionSchema, generateBreadcrumbSchema, generateCategoryFAQSchema } from '@/lib/structured-data'
import PickteumTracker from '@/components/analytics/pickteum-tracker'

// 🔥 ISR 설정 - 5분마다 페이지 재검증 (성능 최적화)
export const revalidate = 300 // 5분마다 재검증

// 🔥 정적 페이지 생성을 위한 경로 미리 생성
export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    const staticCategories = [
      '건강', '스포츠', '정치/시사', '경제', '라이프', '테크'
    ]
    
    // 데이터베이스의 카테고리와 하드코딩된 카테고리를 합쳐서 중복 제거
    const allCategories = [
      ...staticCategories,
      ...categories.map(cat => cat.name)
    ]
    
    const uniqueCategories = [...new Set(allCategories)]
    
    return uniqueCategories.map((name) => ({
      name: encodeURIComponent(name),
    }))
  } catch (error) {
    console.error('generateStaticParams 오류:', error)
    // 기본 카테고리라도 반환
    return [
      { name: encodeURIComponent('건강') },
      { name: encodeURIComponent('스포츠') },
      { name: encodeURIComponent('정치/시사') },
      { name: encodeURIComponent('경제') },
      { name: encodeURIComponent('라이프') },
      { name: encodeURIComponent('테크') }
    ]
  }
}

// 🔥 영어 카테고리명을 한글로 매핑 (404 에러 해결)
function getCategoryName(rawName: string): string {
  const categoryMapping: { [key: string]: string } = {
    'health': '건강',
    'sports': '스포츠', 
    'politics': '정치/시사',
    'economy': '경제',
    'lifestyle': '라이프',
    'tech': '테크'
  }
  
  const decodedName = decodeURIComponent(rawName)
  return categoryMapping[decodedName.toLowerCase()] || decodedName
}

// 🔥 카테고리별 상세 설명 추가 (콘텐츠 품질 강화)
function getCategoryDescription(categoryName: string): string {
  const descriptions: { [key: string]: string } = {
    '건강': '건강한 삶을 위한 최신 의학 정보, 영양 가이드, 운동법, 질병 예방법 등 건강 관련 모든 정보를 제공합니다. 전문의의 조언과 검증된 건강 정보로 여러분의 웰빙 라이프를 지원합니다.',
    '스포츠': '국내외 스포츠 소식, 경기 결과, 선수 인터뷰, 스포츠 분석 등 스포츠 팬들을 위한 종합 정보를 제공합니다. 프로야구, 축구, 농구, 배구 등 다양한 종목의 생생한 소식을 만나보세요.',
    '정치/시사': '국내외 정치 동향, 정책 분석, 시사 이슈, 선거 정보 등 시민들이 알아야 할 정치 정보를 객관적이고 균형 있게 전달합니다. 민주주의 발전을 위한 정보 공유의 장입니다.',
    '경제': '경제 동향, 주식 시장, 부동산, 금융 정책, 기업 뉴스 등 경제 전반의 정보를 제공합니다. 개인 재테크부터 거시경제까지, 경제적 의사결정에 도움이 되는 정보를 전달합니다.',
    '라이프': '일상 생활의 팁, 문화 트렌드, 여행 정보, 음식, 패션, 취미 등 삶의 질을 높이는 다양한 라이프스타일 정보를 제공합니다. 더 풍요로운 일상을 위한 실용적인 정보를 만나보세요.',
    '테크': '최신 기술 동향, IT 뉴스, 스마트폰, 컴퓨터, 인공지능, 블록체인 등 기술 관련 모든 정보를 제공합니다. 빠르게 변화하는 디지털 세상의 트렌드를 놓치지 마세요.'
  }
  
  return descriptions[categoryName] || `${categoryName} 카테고리의 다양한 콘텐츠를 만나보세요.`
}

// 🔥 카테고리별 키워드 추가 (SEO 강화)
function getCategoryKeywords(categoryName: string): string[] {
  const keywords: { [key: string]: string[] } = {
    '건강': ['건강정보', '의학뉴스', '영양가이드', '운동법', '질병예방', '웰빙', '헬스케어', '의료정보'],
    '스포츠': ['스포츠뉴스', '경기결과', '프로야구', '축구', '농구', '배구', '올림픽', '스포츠분석'],
    '정치/시사': ['정치뉴스', '정책분석', '시사이슈', '국정감사', '선거', '정부정책', '국회', '외교'],
    '경제': ['경제뉴스', '주식시장', '부동산', '금융정책', '기업뉴스', '재테크', '투자정보', '경제동향'],
    '라이프': ['라이프스타일', '생활정보', '문화트렌드', '여행정보', '음식', '패션', '취미', '일상팁'],
    '테크': ['기술뉴스', 'IT정보', '스마트폰', '인공지능', '블록체인', '소프트웨어', '하드웨어', '디지털트렌드']
  }
  
  return keywords[categoryName] || [categoryName, '뉴스', '정보']
}

// 🔥 SEO 강화된 카테고리별 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const categoryName = getCategoryName(name)
  
  try {
    // 더 안전한 방식으로 카테고리 및 아티클 수 확인
    const { articles } = await getArticles({
      page: 1,
      limit: 1,
      category: categoryName
    })

    const hasArticles = articles.length > 0
    const articleCount = articles.length
  
  // 🔥 SEO 최적화된 메타 설명 생성 (콘텐츠 품질 강화)
  const baseDescription = getCategoryDescription(categoryName)
  const enhancedDescription = hasArticles 
    ? `${baseDescription} 현재 ${articleCount}개의 최신 콘텐츠가 있습니다.`
    : `${baseDescription} 곧 새로운 콘텐츠가 업데이트될 예정입니다.`

  // 🔥 카테고리별 키워드 추가
  const categoryKeywords = getCategoryKeywords(categoryName)

  return {
    title: `${categoryName} - 픽틈`,
    description: enhancedDescription.length > 160 ? enhancedDescription.substring(0, 157) + '...' : enhancedDescription,
    keywords: ['픽틈', '뉴스', '이슈', ...categoryKeywords].join(', '),
    alternates: {
      canonical: `https://www.pickteum.com/category/${categoryName}`,
    },
    // 🔥 콘텐츠가 없는 카테고리는 색인하지 않음 (SEO 품질 개선)
    robots: {
      index: hasArticles, // 아티클이 있을 때만 색인 허용
      follow: true,
    },
    openGraph: {
      title: `${categoryName} - 틈 날 땐? 픽틈!`,
      description: enhancedDescription,
      type: 'website',
      url: `https://www.pickteum.com/category/${categoryName}`,
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
  } catch (error) {
    console.error('generateMetadata 오류:', error)
    
    // 오류 발생 시 기본 메타데이터 반환
    const baseDescription = getCategoryDescription(categoryName)
    const categoryKeywords = getCategoryKeywords(categoryName)
    
    return {
      title: `${categoryName} - 픽틈`,
      description: baseDescription.length > 160 ? baseDescription.substring(0, 157) + '...' : baseDescription,
      keywords: ['픽틈', '뉴스', '이슈', ...categoryKeywords].join(', '),
      alternates: {
        canonical: `https://www.pickteum.com/category/${categoryName}`,
      },
      robots: {
        index: true, // 기본적으로 색인 허용
        follow: true,
      },
      openGraph: {
        title: `${categoryName} - 틈 날 땐? 픽틈!`,
        description: baseDescription,
        type: 'website',
        url: `https://www.pickteum.com/category/${categoryName}`,
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
        description: baseDescription,
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
}

export default async function CategoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const categoryName = getCategoryName(name)
  
  try {
    // 🔥 더 안전한 데이터 fetching - lib/data.ts 사용
    const { articles, total } = await getArticles({
      page: 1,
      limit: 20,
      category: categoryName
    })

    // 카테고리 정보 가져오기
    const categories = await getCategories()
    const category = categories.find(cat => cat.name === categoryName) || {
      id: 'default',
      name: categoryName,
      color: getCategoryColor(categoryName)
    }

    // 아티클이 없어도 페이지는 표시 (404로 가지 않음)
    const formattedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      category: article.category,
      thumbnail: article.thumbnail,
      date: article.date,
      publishedAt: article.publishedAt,
      slug: article.slug
    }))

    // 🔥 구조화된 데이터용 아티클 형식 변환
    const schemaArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug || article.id,
      thumbnail: article.thumbnail,
      published_at: article.publishedAt,
      created_at: article.date,
      updated_at: article.date,
      content: "",
      author: "픽틈 에디터",
      category: {
        id: category.id,
        name: article.category.name,
        color: article.category.color
      },
      views: 0
    }))

    // 🔥 구조화된 데이터 생성
    const categoryCollectionSchema = generateCategoryCollectionSchema(
      category, 
      schemaArticles
    )
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "홈", url: "https://www.pickteum.com" },
      { name: categoryName, url: `https://www.pickteum.com/category/${categoryName}` }
    ])
    const faqSchema = generateCategoryFAQSchema(categoryName)

    return (
      <>
        {/* 구조화된 데이터 삽입 (FAQ 추가) */}
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />

        <div className="flex min-h-screen flex-col bg-white">
          <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
            {/* 픽틈 추적 컴포넌트 추가 */}
            <PickteumTracker categoryName={categoryName} />
            
            <Header />
            
            <main className="flex-grow px-4 py-6">
              {/* 🔥 SEO 최적화된 카테고리 헤더 (콘텐츠 품질 강화) */}
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
                <p className="text-[#767676] mb-3" role="contentinfo">
                  {categoryName} 카테고리의 최신 콘텐츠 {formattedArticles.length}개
                </p>
                
                {/* 🔥 카테고리 상세 설명 추가 (콘텐츠 품질 대폭 강화) */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#333333] leading-relaxed">
                    {getCategoryDescription(categoryName)}
                  </p>
                </div>
                
                {/* 🔥 추가 SEO 정보 */}
                <div className="sr-only">
                  <span>픽틈의 {categoryName} 카테고리 페이지입니다. 총 {formattedArticles.length}개의 아티클이 있습니다.</span>
                  <span>{getCategoryDescription(categoryName)}</span>
                </div>
              </header>

              {/* 🔥 SEO 최적화된 아티클 목록 */}
              {formattedArticles.length > 0 ? (
                <section>
                  <h2 className="sr-only">{categoryName} 아티클 목록</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {formattedArticles.map((article, index) => (
                      <ContentCard
                        key={article.id}
                        {...article}
                        priority={index < 3} // 상위 3개만 priority
                      />
                    ))}
                  </div>
                </section>
              ) : (
                // 🔥 빈 카테고리도 의미있는 콘텐츠 제공
                <section className="text-center py-12">
                  <div className="bg-gradient-to-br from-[#FFC83D]/10 to-[#FFB800]/10 rounded-lg p-8 mb-6">
                    <h2 className="text-lg font-semibold text-[#212121] mb-3">
                      {categoryName} 콘텐츠 준비 중
                    </h2>
                    <p className="text-[#767676] text-sm leading-relaxed mb-4">
                      {categoryName} 카테고리의 양질의 콘텐츠를 준비하고 있습니다.<br />
                      곧 유용한 정보들을 만나보실 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getCategoryKeywords(categoryName).slice(0, 4).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white rounded-full text-xs text-[#767676] border"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </main>
            
            <Footer />
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('카테고리 페이지 오류:', error)
    
    // 오류가 발생해도 기본 카테고리 페이지 표시 (404로 가지 않음)
    const defaultCategory = {
      id: 'default',
      name: categoryName,
      color: getCategoryColor(categoryName)
    }
    
    const faqSchema = generateCategoryFAQSchema(categoryName)
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "홈", url: "https://www.pickteum.com" },
      { name: categoryName, url: `https://www.pickteum.com/category/${categoryName}` }
    ])

    return (
      <>
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
            <PickteumTracker categoryName={categoryName} />
            <Header />
            
            <main className="flex-grow px-4 py-6">
              <header className="mb-6">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: defaultCategory.color }}
                    role="presentation"
                    aria-label={`${categoryName} 카테고리 색상`}
                  />
                  <h1 className="text-2xl font-bold text-[#212121]">{categoryName}</h1>
                </div>
                <p className="text-[#767676] mb-3" role="contentinfo">
                  {categoryName} 카테고리의 최신 콘텐츠
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#333333] leading-relaxed">
                    {getCategoryDescription(categoryName)}
                  </p>
                </div>
              </header>

              {/* 콘텐츠 준비 중 메시지 */}
              <section className="text-center py-12">
                <div className="bg-gradient-to-br from-[#FFC83D]/10 to-[#FFB800]/10 rounded-lg p-8 mb-6">
                  <h2 className="text-lg font-semibold text-[#212121] mb-3">
                    {categoryName} 콘텐츠 준비 중
                  </h2>
                  <p className="text-[#767676] text-sm leading-relaxed mb-4">
                    {categoryName} 카테고리의 양질의 콘텐츠를 준비하고 있습니다.<br />
                    곧 유용한 정보들을 만나보실 수 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {getCategoryKeywords(categoryName).slice(0, 4).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white rounded-full text-xs text-[#767676] border"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </main>
            
            <Footer />
          </div>
        </div>
      </>
    )
  }
}

// 🔥 카테고리별 기본 색상 지정
function getCategoryColor(categoryName: string): string {
  const colorMapping: { [key: string]: string } = {
    '건강': '#4CAF50',
    '스포츠': '#2196F3', 
    '정치/시사': '#9C27B0',
    '경제': '#FF9800',
    '라이프': '#FF5722',
    '테크': '#607D8B'
  }
  
  return colorMapping[categoryName] || '#767676'
} 