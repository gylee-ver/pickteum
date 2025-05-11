"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type CategoryContextType = {
  activeCategory: string
  setActiveCategory: (category: string) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState("전체")

  return <CategoryContext.Provider value={{ activeCategory, setActiveCategory }}>{children}</CategoryContext.Provider>
}

export function useCategory() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error("useCategory must be used within a CategoryProvider")
  }
  return context
}
