import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ContentCard from "@/components/content-card"
import Footer from "@/components/footer"

// 샘플 데이터
const SAMPLE_ARTICLE = {
  id: "1",
  title: "건강한 식습관으로 면역력 높이는 7가지 방법",
  category: { name: "건강", color: "#4CAF50" },
  author: "김건강",
  date: "2025.05.10",
  thumbnail: "/healthy-vegetables.png",
  content: `
    <p>현대인의 바쁜 생활 속에서 건강한 식습관을 유지하는 것은 쉽지 않습니다. 하지만 면역력 강화를 위해서는 올바른 식습관이 필수적입니다. 이 글에서는 일상에서 쉽게 실천할 수 있는 7가지 식습관을 소개합니다.</p>
    
    <h2>1. 다양한 색상의 채소와 과일 섭취하기</h2>
    <p>다양한 색상의 채소와 과일에는 각기 다른 항산화 물질과 비타민이 포함되어 있습니다. 매일 5가지 이상의 다른 색상 채소와 과일을 섭취하는 것이 좋습니다.</p>
    
    <h2>2. 충분한 단백질 섭취하기</h2>
    <p>단백질은 면역 세포를 만드는 데 필수적인 영양소입니다. 살코기, 생선, 계란, 콩류 등 양질의 단백질을 매 끼니에 포함시키는 것이 중요합니다.</p>
    
    <h2>3. 발효식품 즐기기</h2>
    <p>김치, 요구르트, 케피어 등의 발효식품은 장내 유익균을 늘려 면역력 향상에 도움을 줍니다. 매일 소량씩 꾸준히 섭취하는 것이 좋습니다.</p>
  `,
}

const RELATED_ARTICLES = [
  {
    id: "2",
    title: "면역력 높이는 간단한 운동법 5가지",
    category: { name: "건강", color: "#4CAF50" },
    thumbnail: "/diverse-fitness.png",
    date: "2025.05.08",
  },
  {
    id: "3",
    title: "수면의 질을 높이는 저녁 루틴",
    category: { name: "건강", color: "#4CAF50" },
    thumbnail: "/sleep-quality-bedroom.png",
    date: "2025.05.07",
  },
  {
    id: "4",
    title: "스트레스 관리와 면역력의 관계",
    category: { name: "건강", color: "#4CAF50" },
    thumbnail: "/stress-management-meditation.png",
    date: "2025.05.05",
  },
]

export default function ArticlePage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-14 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
                <span className="sr-only">뒤로 가기</span>
              </Button>
            </Link>
            <h1 className="text-base font-medium text-[#212121] line-clamp-1 mx-auto">
              {SAMPLE_ARTICLE.category.name}
            </h1>
            <Button variant="ghost" size="icon">
              <Share2 size={20} />
              <span className="sr-only">공유하기</span>
            </Button>
          </div>
        </header>

        <main className="flex-grow">
          <article className="px-4 py-6">
            <div className="mb-4">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-2"
                style={{ backgroundColor: SAMPLE_ARTICLE.category.color }}
              >
                {SAMPLE_ARTICLE.category.name}
              </span>
              <h1 className="text-xl font-bold text-[#212121] mb-2">{SAMPLE_ARTICLE.title}</h1>
              <div className="flex items-center text-sm text-[#767676]">
                <span>{SAMPLE_ARTICLE.author}</span>
                <span className="mx-2">·</span>
                <span>{SAMPLE_ARTICLE.date}</span>
              </div>
            </div>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
              <Image
                src={SAMPLE_ARTICLE.thumbnail || "/placeholder.svg"}
                alt={SAMPLE_ARTICLE.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div
              className="prose prose-sm max-w-none text-[#333333]"
              dangerouslySetInnerHTML={{ __html: SAMPLE_ARTICLE.content }}
            />

            <div className="mt-12 mb-8">
              <h2 className="text-lg font-bold text-[#212121] mb-4">관련 콘텐츠</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RELATED_ARTICLES.map((article) => (
                  <ContentCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    category={article.category}
                    thumbnail={article.thumbnail}
                    date={article.date}
                  />
                ))}
              </div>
            </div>
          </article>
        </main>

        {/* 플로팅 공유 버튼 */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button size="icon" className="rounded-full bg-[#FFC83D] hover:bg-[#FFB800] shadow-md">
            <Share2 size={20} />
            <span className="sr-only">공유하기</span>
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  )
}
