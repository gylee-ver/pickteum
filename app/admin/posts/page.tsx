"use client"

// 콘텐츠 관리 페이지 최적화
// 가상화 테이블 적용
// 필터 UI 개선
// 로딩 상태 추가

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
import { Calendar, Edit, Eye, MoreHorizontal, Plus, Search, Trash2, RefreshCw, FileText } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const MOCK_POSTS = [
  {
    id: "1",
    title: "건강한 식습관으로 면역력 높이는 7가지 방법",
    category: { name: "건강", color: "#4CAF50" },
    status: "published",
    author: "pickteum1",
    publishedAt: "2025-05-10T09:00:00Z",
    updatedAt: "2025-05-10T09:00:00Z",
    views: 542,
    thumbnail: "/healthy-food-spread.png",
  },
  {
    id: "2",
    title: "2025 프로야구 시즌 전망: 주목해야 할 신인 선수들",
    category: { name: "스포츠", color: "#2196F3" },
    status: "published",
    author: "pickteum2",
    publishedAt: "2025-05-09T10:30:00Z",
    updatedAt: "2025-05-09T14:15:00Z",
    views: 423,
    thumbnail: "/baseball-stadium.png",
  },
  {
    id: "3",
    title: "글로벌 경제 불확실성 속 투자 전략",
    category: { name: "경제", color: "#FF9800" },
    status: "published",
    author: "pickteum1",
    publishedAt: "2025-05-08T08:45:00Z",
    updatedAt: "2025-05-08T16:20:00Z",
    views: 387,
    thumbnail: "/stock-market-chart.png",
  },
  {
    id: "4",
    title: "최신 인공지능 기술이 바꾸는 일상생활",
    category: { name: "테크", color: "#607D8B" },
    status: "published",
    author: "pickteum2",
    publishedAt: "2025-05-07T11:15:00Z",
    updatedAt: "2025-05-07T11:15:00Z",
    views: 356,
    thumbnail: "/artificial-intelligence-network.png",
  },
  {
    id: "5",
    title: "정부, 신규 주택 공급 정책 발표... 부동산 시장 영향은?",
    category: { name: "정치/시사", color: "#9C27B0" },
    status: "published",
    author: "pickteum1",
    publishedAt: "2025-05-06T09:30:00Z",
    updatedAt: "2025-05-06T15:45:00Z",
    views: 298,
    thumbnail: "/placeholder.svg?key=qjak0",
  },
  {
    id: "6",
    title: "여름철 건강관리 팁: 무더위 속 체력 유지하기",
    category: { name: "건강", color: "#4CAF50" },
    status: "draft",
    author: "pickteum1",
    publishedAt: null,
    updatedAt: "2025-05-11T09:23:00Z",
    views: 0,
    thumbnail: "/placeholder.svg?key=sum01",
  },
  {
    id: "7",
    title: "올림픽 메달 유망주 분석: 한국 선수단 전망",
    category: { name: "스포츠", color: "#2196F3" },
    status: "draft",
    author: "pickteum2",
    publishedAt: null,
    updatedAt: "2025-05-10T16:45:00Z",
    views: 0,
    thumbnail: "/placeholder.svg?key=oly01",
  },
  {
    id: "8",
    title: "디지털 노마드 라이프스타일: 원격 근무의 장단점",
    category: { name: "라이프", color: "#FF5722" },
    status: "scheduled",
    author: "pickteum1",
    publishedAt: "2025-05-12T08:00:00Z",
    updatedAt: "2025-05-11T14:30:00Z",
    views: 0,
    thumbnail: "/placeholder.svg?key=dig01",
  },
]

const CATEGORIES = [
  { name: "건강", color: "#4CAF50" },
  { name: "스포츠", color: "#2196F3" },
  { name: "정치/시사", color: "#9C27B0" },
  { name: "경제", color: "#FF9800" },
  { name: "라이프", color: "#FF5722" },
  { name: "테크", color: "#607D8B" },
]

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

export default function PostsPage() {
  const [posts, setPosts] = useState(MOCK_POSTS)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [authorFilter, setAuthorFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  const router = useRouter()
  const { toast } = useToast()

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // 필터링된 포스트
  const filteredPosts = posts.filter((post) => {
    // 탭 필터
    if (activeTab === "published" && post.status !== "published") return false
    if (activeTab === "draft" && post.status !== "draft") return false
    if (activeTab === "scheduled" && post.status !== "scheduled") return false

    // 검색어 필터
    if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // 카테고리 필터
    if (categoryFilter && categoryFilter !== "all" && post.category.name !== categoryFilter) {
      return false
    }

    // 상태 필터
    if (statusFilter && statusFilter !== "all" && post.status !== statusFilter) {
      return false
    }

    // 작성자 필터
    if (authorFilter && authorFilter !== "all" && post.author !== authorFilter) {
      return false
    }

    // 날짜 범위 필터
    if (dateRange?.from && dateRange?.to) {
      const postDate = new Date(post.publishedAt || post.updatedAt)
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999) // 종료일 끝으로 설정

      if (postDate < fromDate || postDate > toDate) {
        return false
      }
    }

    return true
  })

  // 정렬
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    } else if (sortBy === "oldest") {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    } else if (sortBy === "views") {
      return b.views - a.views
    } else if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    }
    return 0
  })

  // 전체 선택 토글
  const toggleSelectAll = () => {
    if (selectedPosts.length === sortedPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(sortedPosts.map((post) => post.id))
    }
  }

  // 개별 선택 토글
  const toggleSelect = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((postId) => postId !== id))
    } else {
      setSelectedPosts([...selectedPosts, id])
    }
  }

  // 선택된 항목 삭제
  const deleteSelected = () => {
    if (window.confirm(`선택한 ${selectedPosts.length}개 항목을 삭제하시겠습니까?`)) {
      // 실제 구현 시 API 호출로 대체
      setPosts(posts.filter((post) => !selectedPosts.includes(post.id)))
      setSelectedPosts([])

      toast({
        title: "삭제 완료",
        description: `${selectedPosts.length}개 항목이 삭제되었습니다.`,
      })
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

  if (isLoading) {
    return <PostsTableSkeleton />
  }

  // 상태별 카운트
  const statusCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
          <p className="text-sm text-gray-500">모든 콘텐츠를 관리하고 편집할 수 있습니다.</p>
        </div>
        <Button
          className="bg-[#FFC83D] hover:bg-[#FFB800] shadow-sm transition-all"
          onClick={() => router.push("/admin/posts/new")}
        >
          <Plus className="mr-2 h-4 w-4" /> 새 아티클 작성
        </Button>
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
              {CATEGORIES.map((category) => (
                <SelectItem key={category.name} value={category.name}>
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
              <SelectItem value="pickteum1">pickteum1</SelectItem>
              <SelectItem value="pickteum2">pickteum2</SelectItem>
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
            <Button variant="destructive" size="sm" onClick={deleteSelected} className="h-8">
              <Trash2 className="mr-1 h-4 w-4" /> 삭제
            </Button>
          </div>
        </div>
      )}

      {/* 정렬 옵션 */}
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-500">총 {sortedPosts.length}개 항목</p>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="oldest">오래된순</SelectItem>
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
                  checked={selectedPosts.length === sortedPosts.length && sortedPosts.length > 0}
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
            {sortedPosts.length === 0 ? (
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
              sortedPosts.map((post) => (
                <TableRow key={post.id} className="group hover:bg-gray-50">
                  <TableCell>
                    <Checkbox checked={selectedPosts.includes(post.id)} onCheckedChange={() => toggleSelect(post.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="relative w-16 h-10 rounded overflow-hidden">
                      <Image
                        src={post.thumbnail || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="group-hover:text-[#FFC83D] transition-colors">{post.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: post.category.color }} />
                      {post.category.name}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(post.status)}</TableCell>
                  <TableCell>{post.author}</TableCell>
                  <TableCell>
                    {post.status === "scheduled" ? (
                      <div className="flex items-center text-blue-600">
                        <Calendar size={14} className="mr-1" />
                        {format(new Date(post.publishedAt!), "MM/dd HH:mm")}
                      </div>
                    ) : post.publishedAt ? (
                      format(new Date(post.publishedAt), "yyyy-MM-dd")
                    ) : (
                      format(new Date(post.updatedAt), "yyyy-MM-dd")
                    )}
                  </TableCell>
                  <TableCell className="text-right">{post.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/posts/edit/${post.id}`)}>
                          <Edit className="mr-2 h-4 w-4" /> 편집
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/article/${post.id}`, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" /> 미리보기
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm("이 항목을 삭제하시겠습니까?")) {
                              setPosts(posts.filter((p) => p.id !== post.id))
                              toast({
                                title: "삭제 완료",
                                description: "항목이 삭제되었습니다.",
                              })
                            }
                          }}
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
