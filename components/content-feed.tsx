"use client"

import { useEffect, useState, useRef } from "react"
import ContentCard from "@/components/content-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategory } from "@/contexts/category-context"
import { Button } from "@/components/ui/button"
import supabase from "@/lib/supabase"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { logger, getImageUrl } from "@/lib/utils"
import PickteumTracker from '@/components/analytics/pickteum-tracker'

// 이미지 프리로딩 함수
const preloadImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    if (url && typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    }
  })
}

export default function ContentFeed() {
  const { activeCategory } = useCategory()
  const [content, setContent] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const pageSize = 5

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
        
        if (error) {
          logger.error('카테고리 로드 오류:', error)
          return
        }
        
        setCategories(data || [])
      } catch (err) {
        logger.error('카테고리 로드 중 예외:', err)
      }
    }
    
    loadCategories()
  }, [])

  // 글 데이터 로드 - categories 의존성 추가
  useEffect(() => {
    // categories가 로드된 후에만 loadArticles 실행
    if (categories.length > 0 || activeCategory === '전체') {
    loadArticles()
    }
  }, [activeCategory, page, categories])

  const loadArticles = async () => {
    if (loadingRef.current) return
    
    setLoading(true)
    loadingRef.current = true
    
    try {
      // Supabase 쿼리 구성
      let query = supabase
        .from('articles')
        .select(`
          id,
          title,
          thumbnail,
          published_at,
          created_at,
          category_id,
          categories!inner(name, color)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)
      
      // 카테고리 필터링
      if (activeCategory !== '전체') {
        const categoryId = categories.find(cat => cat.name === activeCategory)?.id
        if (categoryId) {
          query = query.eq('category_id', categoryId)
        } else {
          logger.warn(`카테고리 "${activeCategory}"의 ID를 찾을 수 없습니다.`)
          setContent([])
          setLoading(false)
          loadingRef.current = false
          return
        }
      }
      
      const { data, error } = await query
      
      if (error) {
        logger.error('아티클 로드 오류:', error)
        setError(true)
        return
      }
      
      logger.log('로드된 아티클:', data)
      
      // 아티클 데이터 변환
      const formattedData = data.map(article => {
        const imageUrl = getImageUrl(article.thumbnail)
        return {
          id: article.id,
          title: article.title,
          category: {
            name: (article as any).categories?.name || '미분류',
            color: (article as any).categories?.color || '#cccccc'
          },
          thumbnail: imageUrl,
          date: article.published_at ? 
            format(new Date(article.published_at), 'yyyy.MM.dd', { locale: ko }) : 
            format(new Date(), 'yyyy.MM.dd', { locale: ko }),
          publishedAt: article.published_at
        }
      })
      
      // 첫 페이지 이미지들 프리로딩
      if (page === 1) {
        const imageUrls = formattedData.slice(0, 3).map(item => item.thumbnail)
        preloadImages(imageUrls)
      }
      
      if (page === 1) {
        setContent(formattedData)
      } else {
        setContent(prev => {
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = formattedData.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
      }
      
      // 더 불러올 데이터가 있는지 확인
      setHasMore(data.length === pageSize)
      
    } catch (err) {
      logger.error('아티클 로드 중 예외:', err)
      setError(true)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  // 필터링된 콘텐츠 – 샘플 데이터를 노출하지 않고, 에러 시 빈 배열 반환
  const filteredContent = content.length > 0 ? content : []
  
  // 전체 탭에서는 기본 5개만 표시
  const displayedContent = activeCategory === "전체" && page === 1 ? 
    filteredContent.slice(0, 5) : filteredContent

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  // 스크롤 이벤트 핸들러 참조 저장
  const scrollHandlerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // 🔥 카테고리가 변경되면 확실하게 초기화
    window.scrollTo(0, 0)
    setPage(1)
    setContent([]) // 콘텐츠 완전 초기화
    setError(false) // 에러 상태도 초기화
    setHasMore(true) // hasMore 상태도 초기화
  }, [activeCategory])

  useEffect(() => {
    // 이전 스크롤 위치 저장
    let lastScrollY = window.scrollY

    // 스크롤 핸들러 정의
    scrollHandlerRef.current = () => {
      // 스크롤 방향 확인 (아래로 스크롤 중인지)
      const isScrollingDown = window.scrollY > lastScrollY
      lastScrollY = window.scrollY

      // 아래로 스크롤 중이고, 페이지 하단 근처에 도달했으며, 로딩 중이 아닐 때만 추가 콘텐츠 로드
      if (
        isScrollingDown &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        !loadingRef.current &&
        hasMore
      ) {
        handleLoadMore()
      }
    }

    // 스로틀링된 스크롤 이벤트 리스너 등록
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (scrollHandlerRef.current) {
            scrollHandlerRef.current()
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loading, hasMore])

  if (displayedContent.length === 0 && !loading) {
    return (
      <div className="mt-8 mb-8 text-center py-12">
        <p className="text-[#767676]">"{activeCategory}" 카테고리에 콘텐츠가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <PickteumTracker isHomePage={true} />
        <div className="space-y-4">
          {displayedContent.map((item, index) => (
            <div key={item.id}>
              <ContentCard
                id={item.id}
                title={item.title}
                category={item.category}
                thumbnail={item.thumbnail}
                date={item.date}
                publishedAt={item.publishedAt}
                priority={index === 0}
              />
              {index < displayedContent.length - 1 && (
                <hr className="border-gray-200 my-6" />
              )}
            </div>
          ))}
          {loading && (
            <>
              <div key="skeleton-1">
                <Skeleton className="h-[120px] w-full rounded-lg" />
                <div className="mt-4 border-b border-gray-100"></div>
              </div>
              <div key="skeleton-2">
                <Skeleton className="h-[120px] w-full rounded-lg" />
              </div>
            </>
          )}
        </div>
    </div>
  )
}
