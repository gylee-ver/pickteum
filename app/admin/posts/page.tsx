"use client"

// 콘텐츠 관리 페이지 - Supabase 연동
// 실제 데이터베이스와 연동된 CRUD 작업
// 최적화된 필터링 및 검색 기능

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getImageUrl, generateBlurDataURL } from "@/lib/utils"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, RefreshCw, FileText, AlertCircle } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import supabase from "@/lib/supabase"

// 타입 정의
interface Category {
  id: string
  name: string
  color: string
  created_at: string
}

interface Article {
  id: string
  title: string
  content: string
  category_id: string
  author: string
  slug: string
  status: 'published' | 'draft' | 'scheduled'
  thumbnail: string | null
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  views: number
  tags: string[] | null
  // 조인된 카테고리 정보
  category?: Category
}

// 스켈레톤 로딩 컴포넌트
function PostsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 flex-1" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[240px]" />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <div className="grid grid-cols-8 gap-4 py-3">
            <Skeleton className="h-5 w-5 col-span-1" />
            <Skeleton className="h-5 w-full col-span-7" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-8 gap-4 py-4 border-t">
              <Skeleton className="h-5 w-5 col-span-1" />
              <Skeleton className="h-10 w-full col-span-7" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 에러 상태 컴포넌트
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
      <p className="text-gray-500 mb-4">네트워크 연결을 확인하고 다시 시도해주세요.</p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        다시 시도
      </Button>
    </div>
  )
}

export default function PostsPage() {
  // 상태 정의
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [authorFilter, setAuthorFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      setIsLoading(true)
      setIsError(false)

      // 카테고리 로드
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) {
        console.error('카테고리 로드 오류:', categoriesError)
        throw categoriesError
      }

      // 아티클 로드 (카테고리 조인) - created_at 기준으로 정렬 변경
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories(
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false }) // updated_at에서 created_at으로 변경

      if (articlesError) {
        console.error('아티클 로드 오류:', articlesError)
        throw articlesError
      }

      // 작성자 목록 추출
      const uniqueAuthors = [...new Set(articlesData?.map(article => article.author) || [])]

      setCategories(categoriesData || [])
      setArticles(articlesData || [])
      setAuthors(uniqueAuthors)

    } catch (error) {
      console.error('데이터 로드 실패:', error)
      setIsError(true)
      toast({
        variant: "destructive",
        title: "데이터 로드 실패",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // 예약 발행 체크 함수
  const checkScheduledPosts = async () => {
    try {
      const response = await fetch('/api/posts/publish-scheduled', {
        method: 'POST',
      })
      
      const result = await response.json()
      
      if (result.success && result.publishedCount > 0) {
        console.log(`✅ ${result.publishedCount}개 글이 자동 발행되었습니다.`)
        
        // 데이터 새로고침
        await loadData()
        
        // 토스트 알림
        toast({
          title: "자동 발행 완료",
          description: `${result.publishedCount}개 예약된 글이 발행되었습니다.`,
        })
      }
    } catch (error) {
      console.error('예약 발행 체크 오류:', error)
    }
  }

  // 주기적으로 예약 발행 체크 (1분마다)
  useEffect(() => {
    // 즉시 한 번 체크
    checkScheduledPosts()
    
    // 1분마다 체크
    const interval = setInterval(checkScheduledPosts, 60000) // 60초
    
    return () => clearInterval(interval)
  }, [])

  // 필터링된 아티클
  const filteredArticles = articles.filter((article) => {
    // 탭 필터
    if (activeTab === "published" && article.status !== "published") return false
    if (activeTab === "draft" && article.status !== "draft") return false
    if (activeTab === "scheduled" && article.status !== "scheduled") return false

    // 검색어 필터
    if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // 카테고리 필터
    if (categoryFilter && categoryFilter !== "all" && article.category?.name !== categoryFilter) {
      return false
    }

    // 상태 필터
    if (statusFilter && statusFilter !== "all" && article.status !== statusFilter) {
      return false
    }

    // 작성자 필터
    if (authorFilter && authorFilter !== "all" && article.author !== authorFilter) {
      return false
    }

    // 날짜 범위 필터
    if (dateRange?.from && dateRange?.to) {
      const articleDate = new Date(article.published_at || article.updated_at)
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)

      if (articleDate < fromDate || articleDate > toDate) {
        return false
      }
    }

    return true
  })

  // 정렬
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === "recently_updated") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    } else if (sortBy === "views") {
      return b.views - a.views
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  // 전체 선택 토글
  const toggleSelectAll = () => {
    if (selectedPosts.length === sortedArticles.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(sortedArticles.map((article) => article.id))
    }
  }

  // 개별 선택 토글
  const toggleSelect = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((articleId) => articleId !== id))
    } else {
      setSelectedPosts([...selectedPosts, id])
    }
  }

  // 선택된 항목 삭제
  const deleteSelected = async () => {
    if (!window.confirm(`선택한 ${selectedPosts.length}개 항목을 삭제하시겠습니까?`)) {
      return
    }

    try {
      setIsDeleting(true)

      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', selectedPosts)

      if (error) {
        console.error('삭제 오류:', error)
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description: "선택한 항목을 삭제하는 중 오류가 발생했습니다.",
        })
        return
      }

      // 로컬 상태 업데이트
      setArticles(articles.filter((article) => !selectedPosts.includes(article.id)))
      setSelectedPosts([])

      toast({
        title: "삭제 완료",
        description: `${selectedPosts.length}개 항목이 삭제되었습니다.`,
      })

    } catch (error) {
      console.error('삭제 중 예외:', error)
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: "삭제 중 예상치 못한 오류가 발생했습니다.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // 개별 아티클 삭제
  const deleteArticle = async (articleId: string) => {
    if (!window.confirm("이 항목을 삭제하시겠습니까?")) {
      return
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)

      if (error) {
        console.error('삭제 오류:', error)
        toast({
          variant: "destructive",
          title: "삭제 실패",
          description: "항목을 삭제하는 중 오류가 발생했습니다.",
        })
        return
      }

      // 로컬 상태 업데이트
      setArticles(articles.filter((article) => article.id !== articleId))

      toast({
        title: "삭제 완료",
        description: "항목이 삭제되었습니다.",
      })

    } catch (error) {
      console.error('삭제 중 예외:', error)
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: "삭제 중 예상치 못한 오류가 발생했습니다.",
      })
    }
  }

  // 조회수 업데이트 (수정된 버전)
  const updateViews = async (articleId: string) => {
    try {
      // 현재 조회수 가져오기
      const { data: currentArticle } = await supabase
        .from('articles')
        .select('views')
        .eq('id', articleId)
        .single()

      if (currentArticle) {
        // 조회수 +1 업데이트
        const { error } = await supabase
          .from('articles')
          .update({ views: currentArticle.views + 1 })
          .eq('id', articleId)

        if (error) {
          console.error('조회수 업데이트 오류:', error)
        }
      }
    } catch (error) {
      console.error('조회수 업데이트 중 예외:', error)
    }
  }

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("")
    setCategoryFilter(null)
    setStatusFilter(null)
    setAuthorFilter(null)
    setDateRange(undefined)
    setActiveTab("all")

    toast({
      title: "필터 초기화",
      description: "모든 필터가 초기화되었습니다.",
    })
  }

  // 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">발행됨</Badge>
      case "draft":
        return (
          <Badge variant="outline" className="text-gray-500">
            초안
          </Badge>
        )
      case "scheduled":
        return <Badge className="bg-blue-500">예약됨</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <AdminLayout>
        <PostsTableSkeleton />
      </AdminLayout>
    )
  }

  // 에러 상태
  if (isError) {
    return (
      <AdminLayout>
        <ErrorState onRetry={loadData} />
      </AdminLayout>
    )
  }

  // 상태별 카운트
  const statusCounts = {
    all: articles.length,
    published: articles.filter((p) => p.status === "published").length,
    draft: articles.filter((p) => p.status === "draft").length,
    scheduled: articles.filter((p) => p.status === "scheduled").length,
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
          <p className="text-sm text-gray-500">모든 콘텐츠를 관리하고 편집할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={checkScheduledPosts}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> 예약 발행 체크
          </Button>
          <Button
            className="bg-[#FFC83D] hover:bg-[#FFB800] shadow-sm transition-all"
            onClick={() => router.push("/admin/posts/new")}
          >
            <Plus className="mr-2 h-4 w-4" /> 새 아티클 작성
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                전체 ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger
                value="published"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                발행됨 ({statusCounts.published})
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                초안 ({statusCounts.draft})
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                예약됨 ({statusCounts.scheduled})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 필터 및 검색 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: category.color }} />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="published">발행됨</SelectItem>
              <SelectItem value="draft">초안</SelectItem>
              <SelectItem value="scheduled">예약됨</SelectItem>
            </SelectContent>
          </Select>

          <Select value={authorFilter || ""} onValueChange={(value) => setAuthorFilter(value || null)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="작성자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 작성자</SelectItem>
              {authors.map((author) => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker date={dateRange} onDateChange={setDateRange} locale={ko} align="end" />

          <Button
            variant="outline"
            size="icon"
            onClick={resetFilters}
            title="필터 초기화"
            className="hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
      </div>

      {/* 선택된 항목 액션 */}
      {selectedPosts.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-md flex flex-wrap items-center mb-4 gap-2 border border-amber-200 shadow-sm">
          <span className="text-sm font-medium text-amber-800 mr-4">{selectedPosts.length}개 항목 선택됨</span>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-8 bg-white">
              카테고리 변경
            </Button>
            <Button variant="outline" size="sm" className="h-8 bg-white">
              상태 변경
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={deleteSelected} 
              disabled={isDeleting}
              className="h-8"
            >
              <Trash2 className="mr-1 h-4 w-4" /> 
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </div>
        </div>
      )}

      {/* 정렬 옵션 */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">총 {sortedArticles.length}개 항목</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신 작성순</SelectItem>
            <SelectItem value="oldest">오래된 작성순</SelectItem>
            <SelectItem value="recently_updated">최근 수정순</SelectItem>
            <SelectItem value="views">조회수순</SelectItem>
            <SelectItem value="title">제목순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 콘텐츠 테이블 */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedPosts.length === sortedArticles.length && sortedArticles.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[80px]">썸네일</TableHead>
              <TableHead>제목</TableHead>
              <TableHead className="w-[100px]">카테고리</TableHead>
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead className="w-[100px]">작성자</TableHead>
              <TableHead className="w-[120px]">날짜</TableHead>
              <TableHead className="w-[80px] text-right">조회수</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center">
                    <FileText className="h-12 w-12 text-gray-300 mb-2" />
                    <p>검색 결과가 없습니다.</p>
                    <Button variant="link" className="mt-2" onClick={resetFilters}>
                      필터 초기화하기
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedArticles.map((article) => (
                <TableRow key={article.id} className="group hover:bg-gray-50">
                  <TableCell>
                    <Checkbox 
                      checked={selectedPosts.includes(article.id)} 
                      onCheckedChange={() => toggleSelect(article.id)} 
                    />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-100">
                      {(() => {
                        const imageUrl = getImageUrl(article.thumbnail)
                        const isSupabaseImage = imageUrl.includes('supabase.co/storage')
                        const blurDataURL = generateBlurDataURL(article.thumbnail)
                        return (
                          <Image
                            src={imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                            quality={60}
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                            unoptimized={isSupabaseImage}
                          />
                        )
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <button 
                      className="text-left w-full group-hover:text-[#FFC83D] transition-all duration-200 hover:underline hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-1"
                      onClick={() => router.push(`/admin/posts/edit/${article.id}`)}
                      title="클릭하여 편집"
                    >
                      <span className="truncate block max-w-[300px]">{article.title}</span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: article.category?.color }} />
                      {article.category?.name}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>
                    {article.status === "scheduled" ? (
                      <div className="flex items-center text-blue-600">
                        <Calendar size={14} className="mr-1" />
                        {format(new Date(article.published_at!), "MM/dd HH:mm")}
                      </div>
                    ) : article.published_at ? (
                      format(new Date(article.published_at), "yyyy-MM-dd")
                    ) : (
                      format(new Date(article.updated_at), "yyyy-MM-dd")
                    )}
                  </TableCell>
                  <TableCell className="text-right">{article.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/posts/edit/${article.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> 편집
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            updateViews(article.id)
                            window.open(`/article/${article.id}`, "_blank")
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> 미리보기
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteArticle(article.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  )
} 