"use client"

import { useCategory } from "@/contexts/category-context"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function CategoryFilter() {
  const { activeCategory, setActiveCategory } = useCategory()

  const categories = [
    { name: "전체", color: "#767676" },
    { name: "건강", color: "#4CAF50" },
    { name: "스포츠", color: "#2196F3" },
    { name: "정치/시사", color: "#9C27B0" },
    { name: "경제", color: "#FF9800" },
    { name: "라이프", color: "#FF5722" },
    { name: "테크", color: "#607D8B" },
  ]

  return (
    <div className="my-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 py-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={cn(
                "px-4 py-2 rounded-full text-sm transition-all",
                activeCategory === category.name
                  ? "bg-[#FFC83D] text-white font-medium"
                  : "bg-gray-100 text-[#333333] hover:bg-gray-200",
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  )
}
