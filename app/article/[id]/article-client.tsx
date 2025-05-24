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

interface ArticleClientProps {
  articleId: string
  initialArticle?: any // 초기 아티클 데이터
}

export default function ArticleClient({ articleId, initialArticle }: ArticleClientProps) {
  const [article, setArticle] = useState<any>(initialArticle || null)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(!initialArticle)

  useEffect(() => {
    if (initialArticle) {
      // 🔥 조회수 증가 (비동기)
      const updateViews = async () => {
        try {
          await supabase
            .from('articles')
            .update({ views: (initialArticle.views || 0) + 1 })
            .eq('id', articleId)
        } catch (error) {
          console.error('조회수 업데이트 오류:', error)
        }
      }
      updateViews()
      
      // 관련 아티클 로드
      loadRelatedArticles(initialArticle.category_id)
      setLoading(false)
    }
  }, [articleId, initialArticle])

  const loadRelatedArticles = async (categoryId: string) => {
    if (!categoryId) return;
    
    try {
      const { data: relatedData, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(
            id,
            name,
            color
          )
        `)
        .eq('category_id', categoryId)
        .eq('status', 'published')
        .neq('id', articleId)
        .order('published_at', { ascending: false })
        .limit(3)
      
      if (!error && relatedData) {
        setRelatedArticles(relatedData.map(article => ({
          id: article.id,
          title: article.title,
          category: {
            name: article.category?.name || '미분류',
            color: article.category?.color || '#cccccc'
          },
          thumbnail: article.thumbnail || '/placeholder.svg',
          date: article.published_at ? 
            format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
            format(new Date(article.created_at), 'yyyy.MM.dd', { locale: ko })
        })))
      }
    } catch (error) {
      console.error('관련 아티클 로드 오류:', error)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!article) {
    return <ErrorState />
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-14 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
                <span className="sr-only">뒤로 가기</span>
              </Button>
            </Link>
            <h1 className="mx-auto text-lg font-bold text-[#212121] truncate max-w-[200px]">
              {article.category?.name || '픽틈'}
            </h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={async () => {
                try {
                  // 단축 URL 생성
                  const response = await fetch('/api/short', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleId: article.id })
                  })
                  
                  const { shortUrl } = await response.json()
                  
                  if (navigator.share) {
                    await navigator.share({
                      title: article.title,
                      text: article.seo_description || article.content?.substring(0, 100),
                      url: shortUrl, // 단축 URL 사용
                    })
                  } else {
                    await navigator.clipboard.writeText(shortUrl)
                    alert('단축 링크가 복사되었습니다!')
                  }
                } catch (error) {
                  console.error('공유 오류:', error)
                  // 실패시 기존 URL 사용
                  navigator.clipboard.writeText(window.location.href)
                  alert('링크가 복사되었습니다!')
                }
              }}
            >
              <Share2 size={20} />
              <span className="sr-only">공유하기</span>
            </Button>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow">
          <article className="px-4 py-6">
            {/* 아티클 헤더 */}
            <div className="mb-4">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-2"
                style={{ backgroundColor: article.category?.color || '#cccccc' }}
              >
                {article.category?.name || '미분류'}
              </span>
              <h1 className="text-xl font-bold text-[#212121] mb-2">{article.title}</h1>
              <div className="flex items-center text-sm text-[#767676]">
                <span>{article.author}</span>
                <span className="mx-2">·</span>
                <span>
                  {article.published_at ? 
                    format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
                    format(new Date(article.created_at), 'yyyy.MM.dd', { locale: ko })
                  }
                </span>
                {article.views && (
                  <>
                    <span className="mx-2">·</span>
                    <span>조회 {article.views.toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>

            {/* 썸네일 이미지 */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
              <Image
                src={article.thumbnail || "/placeholder.svg"}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* 아티클 본문 */}
            <div
              className="prose prose-sm max-w-none text-[#333333]"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* 관련 콘텐츠 */}
            {relatedArticles.length > 0 && (
              <div className="mt-12 mb-8">
                <h2 className="text-lg font-bold text-[#212121] mb-4">관련 콘텐츠</h2>
                <div className="grid grid-cols-1 gap-4">
                  {relatedArticles.map((relatedArticle) => (
                    <ContentCard
                      key={relatedArticle.id}
                      id={relatedArticle.id}
                      title={relatedArticle.title}
                      category={relatedArticle.category}
                      thumbnail={relatedArticle.thumbnail}
                      date={relatedArticle.date}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>

        <Footer />
      </div>
    </div>
  )
}

// 로딩 스켈레톤 컴포넌트
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-14 px-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
            <Skeleton className="h-6 w-20 mx-auto" />
            <Button variant="ghost" size="icon">
              <Share2 size={20} />
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
        </main>
        <Footer />
      </div>
    </div>
  )
}

// 에러 상태 컴포넌트
function ErrorState() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-14 px-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
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