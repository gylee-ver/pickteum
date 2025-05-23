"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import ContentCard from "@/components/content-card"
import Footer from "@/components/footer"
import supabase from "@/lib/supabase"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { useParams } from "next/navigation"

// 백업용 샘플 데이터
const FALLBACK_ARTICLE = {
  id: "1",
  title: "건강한 식습관으로 면역력 높이는 7가지 방법",
  category: { name: "건강", color: "#4CAF50" },
  author: "pickteum1",
  date: "2025.05.10",
  thumbnail: "/healthy-vegetables.png",
  content: `
    <p>현대인의 바쁜 생활 속에서 건강한 식습관을 유지하는 것은 쉽지 않습니다. 하지만 면역력 강화를 위해서는 올바른 식습관이 필수적입니다. 이 글에서는 일상에서 쉽게 실천할 수 있는 7가지 식습관을 소개합니다.</p>
    
    <h2>1. 다양한 색상의 채소와 과일 섭취하기</h2>
    <p>다양한 색상의 채소와 과일에는 각기 다른 항산화 물질과 비타민이 포함되어 있습니다. 매일 5가지 이상의 다른 색상 채소와 과일을 섭취하는 것이 좋습니다.</p>
    
    <h2>2. 충분한 단백질 섭취하기</h2>
    <p>단백질은 면역 세포를 만드는 데 필수적인 영양소입니다. 살코기, 생선, 계란, 콩류 등 양질의 단백질을 매 끼니에 포함시키는 것이 중요합니다.</p>
  `,
}

export default function ArticlePage() {
  // Next.js 15의 useParams 훅 사용
  const params = useParams();
  const articleId = params?.id as string;
  
  const [article, setArticle] = useState<any>(null)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // articleId가 유효한 경우에만 데이터 로드
    if (!articleId) return;
    
    const loadArticle = async () => {
      setLoading(true)
      try {
        // 아티클 상세 정보 로드
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            categories:category_id (name, color)
          `)
          .eq('id', articleId)
          .single()
        
        if (error) {
          console.error('아티클 로드 오류:', error)
          setError(true)
          return
        }
        
        console.log('로드된 아티클:', data)
        
        // 아티클 조회수 증가 (추후 구현)
        try {
          await supabase
            .from('articles')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', articleId)
        } catch (viewsError) {
          console.error('조회수 업데이트 오류:', viewsError)
          // 조회수 업데이트 실패는 무시
        }
        
        // 포맷팅된 아티클 데이터
        setArticle({
          id: data.id,
          title: data.title,
          content: data.content,
          category: {
            name: data.categories?.name || '미분류',
            color: data.categories?.color || '#cccccc'
          },
          author: data.author,
          date: data.published_at ? 
            format(new Date(data.published_at), 'yyyy.MM.dd', { locale: ko }) : 
            format(new Date(data.created_at), 'yyyy.MM.dd', { locale: ko }),
          thumbnail: data.thumbnail || '/placeholder.svg'
        })
        
        // 관련 아티클 로드 (같은 카테고리의 다른 글)
        if (data.category_id) {
          const { data: relatedData, error: relatedError } = await supabase
            .from('articles')
            .select(`
              *,
              categories:category_id (name, color)
            `)
            .eq('category_id', data.category_id)
            .eq('status', 'published')
            .neq('id', articleId)
            .order('published_at', { ascending: false })
            .limit(3)
          
          if (!relatedError && relatedData) {
            setRelatedArticles(relatedData.map(article => ({
              id: article.id,
              title: article.title,
              category: {
                name: article.categories?.name || '미분류',
                color: article.categories?.color || '#cccccc'
              },
              thumbnail: article.thumbnail || '/placeholder.svg',
              date: article.published_at ? 
                format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
                format(new Date(article.created_at), 'yyyy.MM.dd', { locale: ko })
            })))
          }
        }
      } catch (err) {
        console.error('아티클 로드 중 예외:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    
    loadArticle()
  }, [articleId])
  
  // 로딩 중 상태 표시
  if (loading) {
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
              <Skeleton className="h-6 w-20 mx-auto" />
              <Button variant="ghost" size="icon">
                <Share2 size={20} />
                <span className="sr-only">공유하기</span>
              </Button>
            </div>
          </header>

          <main className="flex-grow px-4 py-6">
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="w-full aspect-video rounded-lg mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
          </main>

          <Footer />
        </div>
      </div>
    )
  }
  
  // 오류 시 폴백 데이터 사용
  const displayArticle = article || (error ? FALLBACK_ARTICLE : null)
  
  // 데이터가 없는 경우
  if (!displayArticle) {
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
            </div>
          </header>
          
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-xl font-bold mb-4">콘텐츠를 찾을 수 없습니다</h1>
              <p className="text-gray-500 mb-6">요청하신 콘텐츠가 존재하지 않거나 삭제되었을 수 있습니다.</p>
              <Link href="/">
                <Button>홈으로 돌아가기</Button>
              </Link>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    )
  }

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
              {displayArticle.category.name}
            </h1>
            <Button variant="ghost" size="icon" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: displayArticle.title,
                  url: window.location.href
                })
              }
            }}>
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
                style={{ backgroundColor: displayArticle.category.color }}
              >
                {displayArticle.category.name}
              </span>
              <h1 className="text-xl font-bold text-[#212121] mb-2">{displayArticle.title}</h1>
              <div className="flex items-center text-sm text-[#767676]">
                <span>{displayArticle.author}</span>
                <span className="mx-2">·</span>
                <span>{displayArticle.date}</span>
              </div>
            </div>

            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
              <Image
                src={displayArticle.thumbnail || "/placeholder.svg"}
                alt={displayArticle.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div
              className="prose prose-sm max-w-none text-[#333333]"
              dangerouslySetInnerHTML={{ __html: displayArticle.content }}
            />

            {relatedArticles.length > 0 && (
              <div className="mt-12 mb-8">
                <h2 className="text-lg font-bold text-[#212121] mb-4">관련 콘텐츠</h2>
                <div className="grid grid-cols-1 gap-4">
                  {relatedArticles.map((article) => (
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
            )}
          </article>
        </main>

        {/* 플로팅 공유 버튼 */}
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="icon"
            className="rounded-full bg-[#FFC83D] hover:bg-[#FFB800] shadow-md"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: displayArticle.title,
                  url: window.location.href
                })
              }
            }}
          >
            <Share2 size={20} />
            <span className="sr-only">공유하기</span>
          </Button>
        </div>
        <Footer />
      </div>
    </div>
  )
}
