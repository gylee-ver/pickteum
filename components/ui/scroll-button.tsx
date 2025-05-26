"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollButton() {
  const pathname = usePathname()
  const [isBottom, setIsBottom] = React.useState(false)
  const [rightPosition, setRightPosition] = React.useState("32px")

  const updateButtonPosition = React.useCallback(() => {
    const content = document.querySelector('[data-content="main"]')
    if (content) {
      const rect = content.getBoundingClientRect()
      const rightOffset = window.innerWidth - (rect.right + 100)
      setRightPosition(`${rightOffset}px`)
    }
  }, [])

  React.useEffect(() => {
    // 메인 페이지가 아니면 이벤트 리스너를 등록하지 않음
    if (pathname !== '/') return

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const isAtBottom = scrollPosition >= documentHeight - 10
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

    updateButtonPosition()
    handleScroll()

    return () => {
      window.removeEventListener("scroll", throttledScroll)
      window.removeEventListener("resize", throttledScroll)
    }
  }, [updateButtonPosition, pathname])

  const handleClick = () => {
    if (isBottom) {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    } else {
      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      )
      
      window.scrollTo({
        top: maxScroll,
        behavior: "smooth"
      })
    }
  }

  // 메인 페이지가 아니면 렌더링하지 않음 (모든 훅 호출 후)
  if (pathname !== '/') {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "fixed z-[100] rounded-full shadow-md transition-all duration-300 hover:shadow-lg",
        "bg-[#FFC83D] hover:bg-[#FFC83D]/90 border-none",
        "bottom-20 hidden md:flex",
        isBottom ? "rotate-360" : ""
      )}
      style={{ right: rightPosition }}
      onClick={handleClick}
    >
      {isBottom ? (
        <ArrowUp className="text-black" />
      ) : (
        <ArrowDown className="text-black" />
      )}
    </Button>
  )
} 