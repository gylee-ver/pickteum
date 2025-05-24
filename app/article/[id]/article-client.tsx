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
                  console.log('공유 버튼 클릭됨')
                  
                  // 단축 URL 생성
                  const response = await fetch('/api/short', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ articleId: article.id })
                  })
                  
                  if (!response.ok) {
                    throw new Error('단축 URL 생성 실패')
                  }
                  
                  const { shortUrl } = await response.json()
                  console.log('생성된 단축 URL:', shortUrl)
                  
                  // 네이티브 공유 시도
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: article.title,
                        text: article.seo_description || article.content?.replace(/<[^>]*>/g, '').substring(0, 100),
                        url: shortUrl,
                      })
                      console.log('네이티브 공유 성공')
                      return // 공유 성공시에만 종료
                    } catch (shareError: any) {
                      console.log('네이티브 공유 에러:', shareError.name, shareError.message)
                      
                      // AbortError(사용자 취소)인 경우에도 클립보드 복사 제안
                      if (shareError.name === 'AbortError') {
                        const userWantsCopy = confirm('공유가 취소되었습니다. 링크를 클립보드에 복사하시겠습니까?')
                        if (!userWantsCopy) {
                          return // 사용자가 복사도 원하지 않으면 종료
                        }
                      }
                      // 다른 에러의 경우 자동으로 클립보드 복사로 넘어감
                    }
                  }
                  
                  // 클립보드 복사 시도
                  console.log('클립보드 복사 시도')
                  await copyToClipboard(shortUrl)
                  alert('단축 링크가 클립보드에 복사되었습니다!')
                  
                } catch (error) {
                  console.error('전체 공유 프로세스 오류:', error)
                  
                  // 최후의 수단: 기존 URL 복사
                  try {
                    await copyToClipboard(window.location.href)
                    alert('링크가 클립보드에 복사되었습니다!')
                  } catch (clipboardError) {
                    console.error('클립보드 복사 실패:', clipboardError)
                    // 클립보드도 실패하면 URL을 직접 보여줌
                    showUrlToUser(window.location.href)
                  }
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

// 안전한 클립보드 복사 함수
async function copyToClipboard(text: string): Promise<void> {
  console.log('클립보드 복사 시도:', text)
  
  // 방법 1: 최신 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      console.log('Clipboard API로 복사 성공')
      return
    } catch (err) {
      console.warn('Clipboard API 실패:', err)
    }
  }
  
  // 방법 2: 레거시 방식
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, 99999) // 모바일 지원
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    if (successful) {
      console.log('레거시 방식으로 복사 성공')
      return
    } else {
      throw new Error('execCommand 실패')
    }
  } catch (err) {
    console.error('레거시 복사 방식 실패:', err)
    throw err
  }
}

// URL을 사용자에게 직접 보여주는 함수
function showUrlToUser(url: string): void {
  const message = `링크를 자동으로 복사할 수 없습니다.\n아래 URL을 수동으로 복사해주세요:\n\n${url}`
  
  // 모바일에서도 잘 보이도록 prompt 사용
  if (window.prompt) {
    window.prompt('링크를 복사하세요:', url)
  } else {
    alert(message)
  }
} 