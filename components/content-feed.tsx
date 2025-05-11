"use client"

import { useEffect, useState, useRef } from "react"
import ContentCard from "@/components/content-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCategory } from "@/contexts/category-context"
import { Button } from "@/components/ui/button"

// 샘플 데이터
const SAMPLE_CONTENT = [
  {
    id: "1",
    title: "건강한 식습관으로 면역력 높이는 7가지 방법",
    category: { name: "건강", color: "#4CAF50" },
    thumbnail: "/healthy-food-spread.png",
    date: "2025.05.10",
  },
  {
    id: "2",
    title: "2025 프로야구 시즌 전망: 주목해야 할 신인 선수들",
    category: { name: "스포츠", color: "#2196F3" },
    thumbnail: "/baseball-stadium.png",
    date: "2025.05.09",
  },
  {
    id: "3",
    title: "글로벌 경제 불확실성 속 투자 전략",
    category: { name: "경제", color: "#FF9800" },
    thumbnail: "/stock-market-chart.png",
    date: "2025.05.08",
  },
  {
    id: "4",
    title: "최신 인공지능 기술이 바꾸는 일상생활",
    category: { name: "테크", color: "#607D8B" },
    thumbnail: "/artificial-intelligence-network.png",
    date: "2025.05.07",
  },
  {
    id: "5",
    title: "정부, 신규 주택 공급 정책 발표... 부동산 시장 영향은?",
    category: { name: "정치/시사", color: "#9C27B0" },
    thumbnail: "/placeholder.svg?key=qjak0",
    date: "2025.05.06",
  },
  {
    id: "6",
    title: "여름철 건강관리 팁: 무더위 속 체력 유지하기",
    category: { name: "건강", color: "#4CAF50" },
    thumbnail: "/placeholder.svg?key=sum01",
    date: "2025.05.05",
  },
  {
    id: "7",
    title: "올림픽 메달 유망주 분석: 한국 선수단 전망",
    category: { name: "스포츠", color: "#2196F3" },
    thumbnail: "/placeholder.svg?key=oly01",
    date: "2025.05.04",
  },
  {
    id: "8",
    title: "디지털 노마드 라이프스타일: 원격 근무의 장단점",
    category: { name: "라이프", color: "#FF5722" },
    thumbnail: "/placeholder.svg?key=dig01",
    date: "2025.05.03",
  },
  {
    id: "9",
    title: "블록체인 기술의 미래: 금융을 넘어선 활용 사례",
    category: { name: "테크", color: "#607D8B" },
    thumbnail: "/placeholder.svg?key=blo01",
    date: "2025.05.02",
  },
  {
    id: "10",
    title: "국제 무역 분쟁이 소비자 물가에 미치는 영향",
    category: { name: "경제", color: "#FF9800" },
    thumbnail: "/placeholder.svg?key=eco01",
    date: "2025.05.01",
  },
]

// 더 많은 콘텐츠 데이터 (무한 스크롤용)
const MORE_CONTENT = [
  {
    id: "11",
    title: "면역력 강화를 위한 비타민 섭취 가이드",
    category: { name: "건강", color: "#4CAF50" },
    thumbnail: "/placeholder.svg?key=vit01",
    date: "2025.04.30",
  },
  {
    id: "12",
    title: "프로축구 리그 중계권 분쟁, 팬들의 시청권은?",
    category: { name: "스포츠", color: "#2196F3" },
    thumbnail: "/placeholder.svg?key=soc01",
    date: "2025.04.29",
  },
]

export default function ContentFeed() {
  const { activeCategory } = useCategory()
  const [content, setContent] = useState(SAMPLE_CONTENT)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const loadingRef = useRef(false)

  // 필터링된 콘텐츠
  const filteredContent = content.filter((item) => activeCategory === "전체" || item.category.name === activeCategory)

  // 전체 탭에서는 5개만 표시
  const displayedContent = activeCategory === "전체" ? filteredContent.slice(0, 5) : filteredContent

  // 더보기 버튼 표시 여부
  const showMoreButton = activeCategory === "전체" && filteredContent.length > 5

  const handleLoadMore = () => {
    if (activeCategory === "전체") {
      // 전체 탭에서는 모든 콘텐츠 표시
      setPage((prev) => prev + 1)
    }
  }

  // 스크롤 이벤트 핸들러 참조 저장
  const scrollHandlerRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // 카테고리가 변경되면 스크롤을 맨 위로 이동
    window.scrollTo(0, 0)
  }, [activeCategory])

  useEffect(() => {
    if (activeCategory === "전체") return // 전체 탭에서는 무한 스크롤 비활성화

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
        !loadingRef.current
      ) {
        loadMoreContent()
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
  }, [loading, activeCategory])

  const loadMoreContent = () => {
    if (loadingRef.current || loading) return

    setLoading(true)
    loadingRef.current = true

    // 실제로는 API 호출을 통해 데이터를 가져옴
    setTimeout(() => {
      setContent((prev) => [...prev, ...MORE_CONTENT])
      setLoading(false)
      loadingRef.current = false
    }, 1500)
  }

  if (displayedContent.length === 0 && !loading) {
    return (
      <div className="mt-8 mb-8 text-center py-12">
        <p className="text-[#767676]">"{activeCategory}" 카테고리에 콘텐츠가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="mt-4 mb-8 space-y-4">
      {displayedContent.map((item, index) => (
        <ContentCard
          key={`${item.id}-${index}`}
          id={item.id}
          title={item.title}
          category={item.category}
          thumbnail={item.thumbnail}
          date={item.date}
        />
      ))}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="w-full py-3 px-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {showMoreButton && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            className="bg-white text-[#333333] border border-[#FFC83D] hover:bg-[#FFF8E1]"
          >
            더보기
          </Button>
        </div>
      )}
    </div>
  )
}
