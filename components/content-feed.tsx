"use client"

import { useEffect, useState, useRef, useLayoutEffect } from "react"
import ContentCard from "@/components/content-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategory } from "@/contexts/category-context"
import { Button } from "@/components/ui/button"
import supabase from "@/lib/supabase"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { logger, getImageUrl } from "@/lib/utils"
import PickteumTracker from '@/components/analytics/pickteum-tracker'

interface Article {
  id: string;
  title: string;
  category: {
    name: string;
    color: string;
  };
  thumbnail: string;
  date: string;
  publishedAt: string;
}

interface ContentFeedProps {
  initialArticles?: Article[];
}

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

export default function ContentFeed({ initialArticles = [] }: ContentFeedProps) {
  const { activeCategory } = useCategory()
  const [content, setContent] = useState<Article[]>(initialArticles)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(initialArticles.length === 0)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const pageSize = 5

  // JS 로드 후 정적(SSR) 피드 숨김
  useEffect(() => {
    const staticEl = document.getElementById('static-feed')
    if (staticEl) {
      staticEl.style.display = 'none'
    }
  }, [])

  // 카테고리 변경을 감지하는 Ref
  const isCategoryChanged = useRef(false);

  useLayoutEffect(() => {
    // activeCategory가 변경되면 플래그를 true로 설정
    isCategoryChanged.current = true;
  }, [activeCategory]);

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

  // 글 데이터 로드
  useEffect(() => {
    const fetchArticles = async () => {
      // 카테고리가 '전체'가 아니고, 카테고리 목록이 아직 로드되지 않았으면 대기
      if (activeCategory !== '전체' && categories.length === 0) {
        return;
      }
      
      // SSR로 받은 초기 데이터가 있고, 첫 페이지이며, '전체' 카테고리일 때는 로드하지 않음
      if (page === 1 && initialArticles.length > 0 && activeCategory === '전체' && !isCategoryChanged.current) {
        setContent(initialArticles);
        setLoading(false);
        setHasMore(initialArticles.length === pageSize);
        return;
      }

      await loadArticles();
      isCategoryChanged.current = false; // 데이터 로드 후 플래그 리셋
    }

    fetchArticles();
  }, [activeCategory, page, categories]);

  const loadArticles = async () => {
    if (loadingRef.current) return
    
    setLoading(true)
    loadingRef.current = true
    
    try {
      // 🔥 새로운 API 라우트 사용 - 서버에서 캐시된 데이터 가져오기
      const response = await fetch(`/api/articles?page=${page}&limit=${pageSize}&category=${encodeURIComponent(activeCategory)}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        logger.error('API 응답 오류:', result.error)
        setError(true)
        return
      }
      
      logger.log('API로부터 로드된 아티클:', result.articles)
      
      const formattedData: Article[] = result.articles
      
      // 첫 페이지 이미지들 프리로딩
      if (page === 1) {
        const imageUrls = formattedData.slice(0, 3).map(item => item.thumbnail)
        preloadImages(imageUrls)
      }
      
      if (page === 1 || isCategoryChanged.current) {
        setContent(formattedData)
      } else {
        setContent(prev => {
          const existingIds = new Set(prev.map(item => item.id))
          const newItems = formattedData.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
      }
      
      // 더 불러올 데이터가 있는지 확인
      setHasMore(result.hasMore)
      
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
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // 스크롤 이벤트 핸들러 참조 저장
  const scrollHandlerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // activeCategory가 변경되면 상태를 초기화
    // '전체' 탭으로 돌아왔을 때 initialArticles로 재설정하는 로직은
    // 메인 useEffect 로직으로 통합.
    setContent([]);
    setPage(1)
    setError(false)
    setHasMore(true)
    window.scrollTo(0, 0)
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
