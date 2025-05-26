"use client"

import * as React from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ScrollButton() {
  const [isBottom, setIsBottom] = React.useState(false)
  const [rightPosition, setRightPosition] = React.useState("32px")

  const updateButtonPosition = React.useCallback(() => {
    const content = document.querySelector('[data-content="main"]')
    if (content) {
      const rect = content.getBoundingClientRect()
      const rightOffset = window.innerWidth - (rect.right + 90)
      setRightPosition(`${rightOffset}px`)
    }
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const isAtBottom = scrollPosition >= documentHeight - 10 // 거의 최하단에 도달했을 때
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
  }, [updateButtonPosition])

  const handleClick = () => {
    if (isBottom) {
      // 맨 위로 스크롤
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    } else {
      // 강제로 최하단까지 스크롤
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