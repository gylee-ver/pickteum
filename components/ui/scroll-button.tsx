"use client"

import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollButton() {
  const [isBottom, setIsBottom] = React.useState(false)
  const [rightPosition, setRightPosition] = React.useState("36px")

  // 콘텐츠 영역 기준으로 버튼 위치 계산
  const updateButtonPosition = React.useCallback(() => {
    const content = document.querySelector('[data-content="main"]')
    if (content) {
      const rect = content.getBoundingClientRect()
      const rightOffset = window.innerWidth - (rect.right + 100)
      setRightPosition(`${rightOffset}px`)
    }
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      // 페이지 하단 도달 여부 확인 로직 수정
      const scrollPosition = window.innerHeight + window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      // 여유값을 50px로 조정하여 더 정확하게 하단 도달 감지
      const isAtBottom = scrollPosition >= documentHeight - 50
      setIsBottom(isAtBottom)
    }

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          updateButtonPosition()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })
    window.addEventListener("resize", throttledScroll, { passive: true })

    // 초기 위치 설정
    updateButtonPosition()
    handleScroll()

    return () => {
      window.removeEventListener("scroll", throttledScroll)
      window.removeEventListener("resize", throttledScroll)
    }
  }, [updateButtonPosition])

  const handleClick = () => {
    if (isBottom) {
      // 맨 위로 스크롤
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    } else {
      // 맨 아래로 스크롤
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth"
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed z-[100] rounded-full shadow-md transition-all duration-300 hover:shadow-lg",
        "bg-[#FFC83D] hover:bg-[#FFC83D]/90 border-none", // 노란색 배경으로 변경
        "bottom-20 hidden md:flex",
        isBottom ? "rotate-360" : ""
      )}
      style={{ right: rightPosition }}
      onClick={handleClick}
    >
      {/* 아이콘 색상을 흰색으로 변경 */}
      {isBottom ? (
        <ArrowUp className="text-black" />
      ) : (
        <ArrowDown className="text-black" />
      )}
    </Button>
  )
} 