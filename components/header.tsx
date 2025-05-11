"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const categories = [
    { name: "건강", color: "#4CAF50" },
    { name: "스포츠", color: "#2196F3" },
    { name: "정치/시사", color: "#9C27B0" },
    { name: "경제", color: "#FF9800" },
    { name: "라이프", color: "#FF5722" },
    { name: "테크", color: "#607D8B" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">
              <span className="text-[#212121]">Pick</span>
              <span className="text-[#FFC83D]">teum</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/category/${encodeURIComponent(category.name)}`}
              className="text-[#333333] hover:text-[#FFC83D] text-sm font-medium transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="icon">
          <Search size={20} />
          <span className="sr-only">검색</span>
        </Button>
      </div>

      {/* 모바일 메뉴 */}
      <div
        className={cn(
          "absolute left-0 right-0 bg-white shadow-md transition-all duration-200 ease-in-out overflow-hidden md:hidden",
          isMenuOpen ? "max-h-[400px] border-b border-gray-100" : "max-h-0",
        )}
      >
        <div className="px-4 py-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/category/${encodeURIComponent(category.name)}`}
              className="block py-3 text-[#333333] hover:text-[#FFC83D] text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
