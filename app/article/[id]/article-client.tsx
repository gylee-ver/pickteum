"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import ContentCard from "@/components/content-card"
import Footer from "@/components/footer"
import supabase from "@/lib/supabase"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import PickteumTracker from '@/components/analytics/pickteum-tracker'
import { getImageUrl } from "@/lib/utils"

interface ArticleClientProps {
  articleId: string
  initialArticle: any
}

export default function ArticleClient({ articleId, initialArticle }: ArticleClientProps) {
  const router = useRouter()
  const [article, setArticle] = useState<any>(initialArticle)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(!initialArticle)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shortUrl, setShortUrl] = useState<string>('')
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState<string>('') // 클라이언트에서만 설정

  // 클라이언트에서만 현재 URL 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }
  }, [])

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

  // 공유 버튼 클릭 핸들러
  const handleShare = async () => {
    try {
      // 🔥 공유 이벤트 추적 추가
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: 'short_url',
          content_type: 'article',
          item_id: article.id,
          article_id: article.id,
          category_name: article.category?.name || '미분류'
        })
      }

      setIsGeneratingUrl(true)
      setShowShareModal(true)
      
      // 단축 URL 생성
      const response = await fetch('/api/short', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id })
      })
      
      if (!response.ok) {
        throw new Error('단축 URL 생성 실패')
      }
      
      const { shortUrl: generatedUrl } = await response.json()
      setShortUrl(generatedUrl)
      
      // 🔥 단축 URL 생성 성공 이벤트
      if (generatedUrl && window.gtag) {
        window.gtag('event', 'short_url_generated', {
          article_id: article.id,
          short_url: generatedUrl,
          original_url: currentUrl
        })
      }
      
    } catch (error) {
      console.error('단축 URL 생성 오류:', error)
      
      // 🔥 에러 추적
      if (window.gtag) {
        window.gtag('event', 'share_error', {
          error_message: error instanceof Error ? error.message : 'Unknown error',
          article_id: article.id
        })
      }
      
      alert('단축 URL 생성에 실패했습니다. 다시 시도해주세요.')
      setShowShareModal(false)
    } finally {
      setIsGeneratingUrl(false)
    }
  }

  // 클립보드 복사 핸들러
  const handleCopyToClipboard = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shortUrl)
      } else {
        // 폴백 방법
        const textArea = document.createElement('textarea')
        textArea.value = shortUrl
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // 2초 후 복사 상태 리셋
      
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      alert('복사에 실패했습니다. URL을 직접 선택해서 복사해주세요.')
    }
  }

  // 모달 닫기
  const handleCloseModal = () => {
    setShowShareModal(false)
    setShortUrl('')
    setIsCopied(false)
  }

  // 스마트 뒤로가기 핸들러
  const handleBackNavigation = () => {
    if (typeof window !== 'undefined') {
      const referrer = document.referrer
      
      // 같은 도메인의 /s/ 경로에서 온 경우 또는 히스토리가 1개만 있는 경우 홈으로
      if (referrer.includes('/s/') || window.history.length <= 1) {
        router.push('/')
        return
      }
      
      // 그 외의 경우 뒤로가기 시도
      try {
        router.back()
      } catch {
        // 뒤로가기 실패 시 홈으로
        router.push('/')
      }
    } else {
      router.push('/')
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
        {/* 픽틈 추적 컴포넌트 추가 */}
        <PickteumTracker 
          articleId={articleId}
          categoryName={article?.category?.name}
        />
        
        {/* 헤더 */}
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <nav className="flex items-center h-14 px-4" role="navigation" aria-label="아티클 네비게이션">
            <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
              <ArrowLeft size={20} />
              <span className="sr-only">뒤로 가기</span>
            </Button>
            <span className="mx-auto text-lg font-bold text-[#212121] truncate max-w-[200px]">
              {article.category?.name || '픽틈'}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
              aria-label="아티클 공유하기"
            >
              <Share2 size={20} />
              <span className="sr-only">공유하기</span>
            </Button>
          </nav>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow">
          <article className="px-4 py-6">
            {/* 🔥 SEO 최적화된 아티클 헤더 */}
            <header className="mb-4">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-2"
                style={{ backgroundColor: article.category?.color || '#cccccc' }}
              >
                {article.category?.name || '미분류'}
              </span>
              {/* 🔥 H1 태그를 아티클 제목으로 변경 (SEO 핵심) */}
              <h1 className="text-xl font-bold text-[#212121] mb-2 leading-tight">{article.title}</h1>
              <div className="flex items-center text-sm text-[#767676]" role="contentinfo">
                <span>{article.author}</span>
                <span className="mx-2">·</span>
                <time dateTime={article.published_at || article.created_at}>
                  {article.published_at ? 
                    format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
                    format(new Date(article.created_at), 'yyyy.MM.dd', { locale: ko })
                  }
                </time>
                {article.views && (
                  <>
                    <span className="mx-2">·</span>
                    <span>조회 {article.views.toLocaleString()}</span>
                  </>
                )}
              </div>
            </header>

            {/* 썸네일 이미지 */}
            <figure className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
              <Image
                src={getImageUrl(article.thumbnail)}
                alt={article.thumbnail_alt || article.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </figure>

            {/* 🔥 SEO 최적화된 아티클 본문 */}
            <section
              className="prose prose-sm max-w-none text-[#333333] article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
              role="main"
              aria-label="아티클 본문"
            />

            {/* 관련 콘텐츠 */}
            {relatedArticles.length > 0 && (
              <aside className="mt-12 mb-8" role="complementary" aria-label="관련 콘텐츠">
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
              </aside>
            )}
          </article>
        </main>

        <Footer />
      </div>

      {/* 공유 모달 */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="w-full max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">링크 공유</DialogTitle>
            <DialogDescription>
              아래 단축 링크를 복사해서 공유하세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 단축 URL 표시 영역 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">단축 링크</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-50 border rounded-lg">
                  {isGeneratingUrl ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#FFC83D] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500">단축 링크 생성 중...</span>
                    </div>
                  ) : (
                    <span className="text-sm font-mono break-all">
                      {shortUrl || '링크를 생성하고 있습니다...'}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={isGeneratingUrl || !shortUrl}
                  className="bg-[#FFC83D] hover:bg-[#FFB800] text-black"
                >
                  {isCopied ? (
                    <>
                      <Check size={16} className="mr-1" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-1" />
                      복사
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 원본 링크 (참고용) - 클라이언트에서만 표시 */}
            {currentUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">원본 링크 (참고)</label>
                <div className="p-2 bg-gray-50 border rounded-lg">
                  <span className="text-xs text-gray-600 break-all">
                    {currentUrl}
                  </span>
                </div>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              💡 단축 링크는 원본 페이지와 동일하게 작동하며, 더 간편하게 공유할 수 있습니다.
            </div>
          </div>

          {/* 모달 하단 버튼 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCloseModal}>
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
  const router = useRouter()
  
  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center h-14 px-4">
            <Button variant="ghost" size="icon" onClick={handleBackNavigation}>
              <ArrowLeft size={20} />
            </Button>
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