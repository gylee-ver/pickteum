"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, Share2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImageUrl } from '@/lib/utils'
import Footer from '@/components/footer'

// 디버그 로깅 유틸리티 (안전한 버전 - console 오류 방지)
const debugLog = (message: string, data?: any) => {
  // 개발 환경에서도 console 사용하지 않음 (오류 방지)
  // 필요시 다른 방식으로 로깅 구현 가능
}

const debugError = (message: string, error?: any) => {
  // 개발 환경에서도 console 사용하지 않음 (오류 방지)
  // 필요시 다른 방식으로 로깅 구현 가능
}

interface PreviewData {
  title: string
  content: string
  category: string
  categoryColor: string
  author: string
  thumbnail: string | null
  publishDate: string
  publishTime: string
  tags: string
  altText: string
  returnUrl?: string
}

// 🔥 마크다운 이미지를 HTML로 변환하는 함수
function convertMarkdownImages(content: string): string {
  debugLog('🖼️ 마크다운 이미지 변환 시작')
  
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  
  const convertedContent = content.replace(imageRegex, (match, altText, imageUrl) => {
    debugLog('🖼️ 발견된 이미지:', { match, altText, imageUrl })
    
    let processedUrl: string
    
    // 로컬 이미지 처리 (local: 프리픽스)
    if (imageUrl.startsWith('local:')) {
      const imageId = imageUrl.replace('local:', '')
      
      // 세션 스토리지에서 로컬 이미지 찾기
      try {
        const localImages = JSON.parse(sessionStorage.getItem('local_images') || '[]')
        const localImage = localImages.find((img: any) => img.id === imageId)
        
        if (localImage && localImage.blobUrl) {
          processedUrl = localImage.blobUrl
          debugLog('🖼️ 로컬 이미지 URL 사용:', processedUrl)
        } else {
          processedUrl = '/placeholder.svg'
          debugLog('🖼️ 로컬 이미지를 찾을 수 없어 placeholder 사용')
        }
      } catch (error) {
        processedUrl = '/placeholder.svg'
        debugLog('🖼️ 로컬 이미지 처리 오류, placeholder 사용')
      }
    } 
    // Base64 이미지 처리
    else if (imageUrl.startsWith('data:image/')) {
      processedUrl = imageUrl
      debugLog('🖼️ Base64 이미지 직접 사용')
    }
    // 기존 URL 처리
    else {
      processedUrl = getImageUrl(imageUrl)
      debugLog('🖼️ 기존 방식으로 URL 처리:', processedUrl)
    }
    
    // HTML img 태그로 변환
    const htmlImg = `<figure class="my-6">
      <img 
        src="${processedUrl}" 
        alt="${altText || '이미지'}" 
        class="w-full h-auto rounded-lg shadow-sm"
        style="max-width: 100%; height: auto;"
        loading="lazy"
      />
      ${altText ? `<figcaption class="text-sm text-gray-600 text-center mt-2 italic">${altText}</figcaption>` : ''}
    </figure>`
    
    debugLog('🖼️ 변환된 HTML:', htmlImg)
    return htmlImg
  })
  
  debugLog('🖼️ 마크다운 이미지 변환 완료')
  return convertedContent
}

function PreviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    debugLog('🔍 미리보기 페이지 로드 시작')
    
    try {
      // URL 파라미터에서 ID 추출
      const previewId = searchParams.get('id')
      debugLog('🔍 미리보기 ID:', previewId)
      
      if (!previewId) {
        // 이전 방식 호환성 유지 (data 파라미터)
        const data = searchParams.get('data')
        if (data) {
          debugLog('🔍 이전 방식 data 파라미터 사용')
          const decoded = JSON.parse(decodeURIComponent(data))
          setPreviewData(decoded)
          setLoading(false)
          return
        }
        
        throw new Error('미리보기 데이터가 없습니다.')
      }

      // 세션 스토리지에서 데이터 가져오기
      const savedData = sessionStorage.getItem(previewId)
      debugLog('🔍 세션 스토리지 데이터 존재:', !!savedData)
      
      if (!savedData) {
        throw new Error('미리보기 데이터를 찾을 수 없습니다. 다시 시도해주세요.')
      }

      debugLog('🔍 데이터 파싱 시작')
      const decoded = JSON.parse(savedData)
      debugLog('🔍 파싱된 데이터:', decoded)
      
      // 필수 필드 검증
      if (!decoded.title || !decoded.content) {
        throw new Error('필수 데이터가 누락되었습니다.')
      }

      setPreviewData(decoded)
      debugLog('🔍 미리보기 데이터 설정 완료')

      // 사용된 세션 데이터 정리 (5초 후)
      setTimeout(() => {
        sessionStorage.removeItem(previewId)
        debugLog('🔍 세션 데이터 정리 완료')
      }, 5000)
      
    } catch (err) {
      debugError('🔍 미리보기 데이터 처리 오류:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  const handleBack = () => {
    debugLog('🔍 뒤로가기 버튼 클릭')
    
    try {
      if (previewData?.returnUrl) {
        debugLog('🔍 저장된 URL로 이동:', previewData.returnUrl)
        router.push(previewData.returnUrl)
      } else {
        debugLog('🔍 이전 페이지로 이동')
        router.back()
      }
    } catch (error) {
      debugError('🔍 뒤로가기 오류:', error)
      router.push('/admin/posts/new')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">미리보기를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !previewData) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center max-w-md">
              <Eye className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-red-600 mb-4">미리보기 오류</h1>
              <p className="text-gray-600 mb-6">{error || '미리보기 데이터를 찾을 수 없습니다.'}</p>
              <div className="space-y-2">
                <Button onClick={handleBack} className="w-full">
                  편집으로 돌아가기
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                  새로고침
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                계속 문제가 발생하면 브라우저를 새로고침해주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  let publishedDate: string
  try {
    publishedDate = format(new Date(`${previewData.publishDate}T${previewData.publishTime}`), 'yyyy.MM.dd', { locale: ko })
  } catch {
    publishedDate = format(new Date(), 'yyyy.MM.dd', { locale: ko })
  }

  // 🔥 썸네일 URL 처리 및 디버깅
  const thumbnailUrl = previewData.thumbnail ? getImageUrl(previewData.thumbnail) : null
  debugLog('🖼️ 썸네일 처리:', {
    original: previewData.thumbnail,
    processed: thumbnailUrl
  })

  // 🔥 본문 콘텐츠에서 마크다운 이미지를 HTML로 변환
  const processedContent = convertMarkdownImages(previewData.content)
  
  debugLog('🔍 미리보기 렌더링 시작:', previewData.title)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="w-full max-w-[480px] mx-auto flex flex-col min-h-screen">
        {/* 미리보기 알림 바 */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="flex items-center justify-center space-x-2">
            <Eye className="h-4 w-4 text-amber-600" />
            <span className="text-amber-800 text-sm font-medium">미리보기 모드</span>
          </div>
        </div>

        {/* 헤더 */}
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
          <nav className="flex items-center h-14 px-4" role="navigation" aria-label="아티클 네비게이션">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft size={20} />
              <span className="sr-only">뒤로 가기</span>
            </Button>
            <span className="mx-auto text-lg font-bold text-[#212121] truncate max-w-[200px]">
              {previewData.category}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              disabled
              aria-label="공유하기 (미리보기 모드에서는 비활성화)"
            >
              <Share2 size={20} className="text-gray-400" />
              <span className="sr-only">공유하기</span>
            </Button>
          </nav>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-grow">
          <article className="px-4 py-6">
            {/* 아티클 헤더 */}
            <header className="mb-4">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-xs text-white mb-2"
                style={{ backgroundColor: previewData.categoryColor }}
              >
                {previewData.category}
              </span>
              <h1 className="text-xl font-bold text-[#212121] mb-2 leading-tight">{previewData.title}</h1>
              <div className="flex items-center text-sm text-[#767676]" role="contentinfo">
                <span>{previewData.author}</span>
                <span className="mx-2">·</span>
                <time dateTime={`${previewData.publishDate}T${previewData.publishTime}`}>
                  {publishedDate}
                </time>
                <span className="mx-2">·</span>
                <span>미리보기</span>
              </div>
            </header>

            {/* 🔥 개선된 썸네일 이미지 */}
            {thumbnailUrl && (
              <figure className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
                <Image
                  src={thumbnailUrl}
                  alt={previewData.altText || previewData.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                  onError={(e) => {
                    debugError('🖼️ 썸네일 이미지 로드 오류:', thumbnailUrl)
                    // 오류 시 placeholder로 대체
                    e.currentTarget.src = '/placeholder.svg'
                  }}
                  onLoad={() => {
                    debugLog('🖼️ 썸네일 이미지 로드 성공:', thumbnailUrl)
                  }}
                />
              </figure>
            )}

            {/* 🔥 개선된 아티클 본문 (실제 아티클과 동일하게) */}
            <section
              className="prose prose-sm max-w-none text-[#333333] article-content"
              dangerouslySetInnerHTML={{ 
                __html: processedContent
              }}
              role="main"
              aria-label="아티클 본문"
            />

            {/* 🔥 실제 아티클처럼 관련 콘텐츠 영역 추가 */}
            <aside className="mt-12 mb-8" role="complementary" aria-label="추천 콘텐츠">
              {/* 미리보기 안내 - 실제 아티클 스타일로 변경 */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-[#212121] mb-4">미리보기 정보</h2>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center mb-2">
                    <Eye className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">미리보기 모드</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    실제 발행 후에는 관련 콘텐츠와 공유 기능이 활성화됩니다.
                  </p>
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    편집으로 돌아가기
                  </Button>
                </div>
              </section>

              {/* 태그 표시 */}
              {previewData.tags && previewData.tags.trim() && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">설정된 태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewData.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </article>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-white">
        <div className="w-full max-w-[480px] mx-auto flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  )
} 