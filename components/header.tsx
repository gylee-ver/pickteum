"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import supabase from "@/lib/supabase"
import { logger } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  category?: {
    name: string
    color: string
  }
}

export default function Header() {
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // 검색 실행
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Supabase에서 제목으로 검색 (대소문자 구분 없이)
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          thumbnail,
          category:categories(name, color)
        `)
        .eq('status', 'published')
        .ilike('title', `%${query}%`)
        .limit(5)

      if (error) {
        logger.error('검색 오류:', error)
        setSearchResults([])
      } else {
        setSearchResults(data || [])
      }
    } catch (error) {
      logger.error('검색 중 예외 발생:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // 검색어 변경 시 디바운싱
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300) // 300ms 디바운싱

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // 검색창 열기/닫기
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setSearchQuery("")
      setSearchResults([])
    }
  }

  // 검색 결과 클릭 시 - 🔥 slug 대신 id 사용
  const handleResultClick = (articleId: string) => {
    router.push(`/article/${articleId}`)
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  // 엔터 키로 검색 - 🔥 slug 대신 id 사용
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleResultClick(searchResults[0].id) // 🔥 변경: slug → id
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F2FF66] border-b border-gray-100 shadow-sm">
      {/* 메인 헤더 - 로고와 검색 */}
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img
              src="/logo_vec.png"
              alt="Pickteum Logo"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* 검색 버튼 */}
        <Button variant="ghost" size="icon" onClick={toggleSearch}>
          <Search size={20} />
          <span className="sr-only">검색</span>
        </Button>
      </div>

      {/* 검색창 (확장된 상태) */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="검색어를 입력하세요..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-4"
                  autoFocus
                />
              </div>
              <Button variant="ghost" size="icon" onClick={toggleSearch}>
                <X size={18} />
              </Button>
            </div>

            {/* 검색 결과 */}
            {searchQuery.trim() && (
              <div className="space-y-2">
                {isSearching ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-[#FFC83D] rounded-full mx-auto mb-2"></div>
                    검색 중...
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-2">
                      검색 결과 ({searchResults.length}개)
                    </p>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleResultClick(result.id)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        {result.thumbnail ? (
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Search size={14} className="text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </p>
                          {result.category && (
                            <p className="text-xs text-gray-500">
                              {result.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Search size={24} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 검색창이 열렸을 때 배경 오버레이 */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={toggleSearch}
        />
      )}
    </header>
  )
}
