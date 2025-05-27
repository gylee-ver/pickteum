"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, PieChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  FileEdit,
  FileText,
  Users,
  Clock,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  ExternalLink,
  ArrowRight,
} from "lucide-react"
import supabase from "@/lib/supabase"
import { logger } from "@/lib/utils"
import { cn } from "@/lib/utils"

// 활동 타입 정의
interface RecentActivity {
  id: string
  type: 'publish' | 'edit' | 'draft' | 'schedule' | 'delete'
  title: string
  time: string
  user: string
  article_id?: string
}

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const MOCK_ANALYTICS = {
  today: {
    visitors: 1245,
    pageviews: 3890,
    avgTime: "2:34",
    bounceRate: "42%",
    change: {
      visitors: 12,
      pageviews: 8,
      avgTime: 5,
      bounceRate: -3,
    },
  },
  topContent: [
    { title: "건강한 식습관으로 면역력 높이는 7가지 방법", views: 542, avgTime: "3:21", category: "건강" },
    { title: "2025 프로야구 시즌 전망: 주목해야 할 신인 선수들", views: 423, avgTime: "2:45", category: "스포츠" },
    { title: "글로벌 경제 불확실성 속 투자 전략", views: 387, avgTime: "4:12", category: "경제" },
    { title: "최신 인공지능 기술이 바꾸는 일상생활", views: 356, avgTime: "3:05", category: "테크" },
    {
      title: "정부, 신규 주택 공급 정책 발표... 부동산 시장 영향은?",
      views: 298,
      avgTime: "2:58",
      category: "정치/시사",
    },
  ],
  categoryData: [
    { name: "건강", value: 35 },
    { name: "스포츠", value: 25 },
    { name: "경제", value: 20 },
    { name: "테크", value: 15 },
    { name: "정치/시사", value: 5 },
  ],
  weeklyTrend: [
    { name: "5/5", visitors: 980, pageviews: 3200 },
    { name: "5/6", visitors: 1050, pageviews: 3400 },
    { name: "5/7", visitors: 1100, pageviews: 3600 },
    { name: "5/8", visitors: 1030, pageviews: 3300 },
    { name: "5/9", visitors: 1150, pageviews: 3700 },
    { name: "5/10", visitors: 1200, pageviews: 3850 },
    { name: "5/11", visitors: 1245, pageviews: 3890 },
  ],
}

// 스켈레톤 로딩 컴포넌트
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// 통계 카드 컴포넌트
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "up",
  isLoading = false,
}: {
  title: string
  value: string | number
  change: number
  icon: React.ElementType
  trend?: "up" | "down"
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    )
  }

  const isPositive = trend === "up" ? change > 0 : change < 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown
  const trendColor = isPositive ? "text-green-600" : "text-red-600"

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center ${trendColor}`}>
          <TrendIcon className="mr-1 h-4 w-4" />
          {Math.abs(change)}% {isPositive ? "증가" : "감소"}
        </p>
      </CardContent>
      <div className={`h-1 w-full ${isPositive ? "bg-green-500" : "bg-red-500"}`}></div>
    </Card>
  )
}

// 활동 배지 컴포넌트 - UI 개선
function ActivityBadge({ type }: { type: string }) {
  switch (type) {
    case "publish":
      return <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-0.5">발행</Badge>
    case "edit":
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-0.5">수정</Badge>
    case "draft":
      return <Badge variant="outline" className="text-gray-600 border-gray-300 text-xs px-2 py-0.5">초안</Badge>
    case "schedule":
      return <Badge className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-2 py-0.5">예약</Badge>
    default:
      return <Badge variant="outline" className="text-xs px-2 py-0.5">{type}</Badge>
  }
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [drafts, setDrafts] = useState<any[]>([])
  const [scheduled, setScheduled] = useState<any[]>([])
  const router = useRouter()

  // 실제 데이터 로드 함수들
  const loadRecentActivity = async () => {
    try {
      // 최근 아티클 활동 가져오기 (최근 10개)
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title, status, author, created_at, updated_at, published_at')
        .order('updated_at', { ascending: false })
        .limit(10)

      if (articlesError) {
        logger.error('아티클 데이터 로드 오류:', articlesError)
        return
      }

      // 활동 데이터 변환
      const activities: RecentActivity[] = []
      
      articles?.forEach(article => {
        // 발행된 아티클
        if (article.status === 'published' && article.published_at) {
          activities.push({
            id: `publish-${article.id}`,
            type: 'publish',
            title: article.title,
            time: article.published_at,
            user: article.author,
            article_id: article.id
          })
        }
        
        // 초안 아티클
        if (article.status === 'draft') {
          activities.push({
            id: `draft-${article.id}`,
            type: 'draft',
            title: article.title,
            time: article.updated_at,
            user: article.author,
            article_id: article.id
          })
        }
        
        // 예약 발행 아티클
        if (article.status === 'scheduled') {
          activities.push({
            id: `schedule-${article.id}`,
            type: 'schedule',
            title: article.title,
            time: article.updated_at,
            user: article.author,
            article_id: article.id
          })
        }
      })

      // 시간순으로 정렬
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      
      setRecentActivity(activities.slice(0, 8)) // 최근 8개만 표시
      
    } catch (err) {
      logger.error('최근 활동 로드 중 예외:', err)
    }
  }

  const loadDraftsAndScheduled = async () => {
    try {
      // 초안 아티클 가져오기
      const { data: draftsData, error: draftsError } = await supabase
        .from('articles')
        .select('id, title, author, updated_at')
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (draftsError) {
        logger.error('초안 데이터 로드 오류:', draftsError)
      } else {
        setDrafts(draftsData || [])
      }

      // 예약 발행 아티클 가져오기
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('articles')
        .select('id, title, author, published_at')
        .eq('status', 'scheduled')
        .order('published_at', { ascending: true })
        .limit(5)

      if (scheduledError) {
        logger.error('예약 발행 데이터 로드 오류:', scheduledError)
      } else {
        setScheduled(scheduledData || [])
      }

    } catch (err) {
      logger.error('초안/예약 발행 데이터 로드 중 예외:', err)
    }
  }

  useEffect(() => {
    // 로그인 상태 확인
    const user = localStorage.getItem("pickteum_user") || sessionStorage.getItem("pickteum_user")
    if (!user) {
      router.push("/admin/login")
      return
    }
    setUserName(user)

    // 실제 데이터 로드
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([
        loadRecentActivity(),
        loadDraftsAndScheduled()
      ])
      setIsLoading(false)
    }

    loadData()
  }, [router])

  // 아티클 편집 페이지로 이동
  const handleEditArticle = (articleId: string) => {
    router.push(`/admin/posts/edit/${articleId}`)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-gray-500">오늘의 통계와 콘텐츠 현황을 확인하세요.</p>
        </div>
        <Button
          className="bg-[#FFC83D] hover:bg-[#FFB800] shadow-sm transition-all"
          onClick={() => router.push("/admin/posts/new")}
        >
          <Plus className="mr-2 h-4 w-4" /> 새 아티클 작성
        </Button>
      </div>

      {/* 퀵 액션 패널 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="방문자"
          value={MOCK_ANALYTICS.today.visitors.toLocaleString()}
          change={MOCK_ANALYTICS.today.change.visitors}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="페이지뷰"
          value={MOCK_ANALYTICS.today.pageviews.toLocaleString()}
          change={MOCK_ANALYTICS.today.change.pageviews}
          icon={FileText}
          trend="up"
        />
        <StatCard
          title="평균 체류시간"
          value={MOCK_ANALYTICS.today.avgTime}
          change={MOCK_ANALYTICS.today.change.avgTime}
          icon={Clock}
          trend="up"
        />
        <StatCard
          title="이탈률"
          value={MOCK_ANALYTICS.today.bounceRate}
          change={Math.abs(MOCK_ANALYTICS.today.change.bounceRate)}
          icon={BarChart3}
          trend="down"
        />
      </div>

      <div className="grid gap-6 mb-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* 주간 트렌드 차트 */}
          <Card className="lg:col-span-4 overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>주간 트렌드</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                  <ExternalLink size={14} /> 상세 보기
                </Button>
              </div>
              <CardDescription>최근 7일간의 방문자 및 페이지뷰 추이</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <LineChart
                  data={MOCK_ANALYTICS.weeklyTrend}
                  categories={["visitors", "pageviews"]}
                  index="name"
                  colors={["#FFC83D", "#94A3B8"]}
                  valueFormatter={(value) => `${value.toLocaleString()}`}
                  yAxisWidth={40}
                  showLegend={true}
                  showXAxis={true}
                  showYAxis={true}
                  showGridLines={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* 카테고리 분포 차트 */}
          <Card className="lg:col-span-3 overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>카테고리 분포</CardTitle>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                  <ExternalLink size={14} /> 상세 보기
                </Button>
              </div>
              <CardDescription>콘텐츠 카테고리별 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <PieChart
                  data={MOCK_ANALYTICS.categoryData}
                  index="name"
                  valueFormatter={(value) => `${value}%`}
                  category="value"
                  colors={["#4CAF50", "#2196F3", "#FF9800", "#607D8B", "#9C27B0"]}
                  showAnimation={true}
                  showTooltip={true}
                  showLegend={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 인기 콘텐츠 */}
          <Card className="col-span-1 overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>인기 콘텐츠</CardTitle>
                  <CardDescription>최근 7일간 조회수 기준</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/analytics")}>
                  전체 보기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ANALYTICS.topContent.map((content, i) => (
                  <div key={i} className="flex items-start group">
                    <div className="mr-3 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none group-hover:text-[#FFC83D] transition-colors">
                        {content.title}
                      </p>
                      <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
                        <Badge variant="outline" className="rounded-full text-xs font-normal">
                          {content.category}
                        </Badge>
                        <span>{content.views.toLocaleString()} 조회</span>
                        <span>{content.avgTime} 평균 체류</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 py-2 px-6">
              <Button
                variant="link"
                className="mx-auto text-sm text-gray-500"
                onClick={() => router.push("/admin/analytics")}
              >
                통계 분석 페이지로 이동
              </Button>
            </CardFooter>
          </Card>

          {/* 할일 목록 - 실제 데이터 사용 */}
          <Card className="col-span-1 overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>할일 목록</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/posts")}>
                  전체 보기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="drafts">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="drafts" className="flex-1">
                    초안 ({drafts.length})
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="flex-1">
                    예약 발행 ({scheduled.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="drafts" className="space-y-4 min-h-[240px]">
                  {drafts.length > 0 ? (
                    drafts.map((draft) => (
                      <div key={draft.id} className="flex items-start justify-between border-b pb-3 group">
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-[#FFC83D] transition-colors">
                            {draft.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>
                              {new Date(draft.updated_at).toLocaleString("ko-KR", {
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{draft.author}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleEditArticle(draft.id)}
                        >
                          <FileEdit className="mr-1 h-4 w-4" />
                          편집
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">초안이 없습니다</p>
                      <Button variant="link" className="mt-2" onClick={() => router.push("/admin/posts/new")}>
                        새 글 작성하기
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="scheduled" className="space-y-4 min-h-[240px]">
                  {scheduled.length > 0 ? (
                    scheduled.map((item) => (
                      <div key={item.id} className="flex items-start justify-between border-b pb-3 group">
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-[#FFC83D] transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="flex items-center text-blue-600">
                              <Calendar size={12} className="mr-1" />
                              {new Date(item.published_at).toLocaleString("ko-KR", {
                                month: "numeric",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{item.author}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleEditArticle(item.id)}
                        >
                          <FileEdit className="mr-1 h-4 w-4" />
                          편집
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">예약된 발행이 없습니다</p>
                      <Button variant="link" className="mt-2" onClick={() => router.push("/admin/posts/new")}>
                        새 글 작성하기
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-gray-50 py-2 px-6">
              <Button
                variant="link"
                className="mx-auto text-sm text-gray-500"
                onClick={() => router.push("/admin/posts")}
              >
                콘텐츠 관리 페이지로 이동
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 최근 활동 - UI 최적화 */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">최근 활동</CardTitle>
                <CardDescription className="text-sm mt-1">관리자 활동 내역</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
                onClick={() => router.push("/admin/posts")}
              >
                모든 활동 보기
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={cn(
                      "relative pl-8 pb-4 group cursor-pointer",
                      index !== recentActivity.length - 1 && "border-b border-gray-100"
                    )}
                    onClick={() => activity.article_id && handleEditArticle(activity.article_id)}
                  >
                    {/* 타임라인 점 */}
                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#FFC83D] border-2 border-white shadow-sm"></div>
                    
                    {/* 타임라인 선 */}
                    {index !== recentActivity.length - 1 && (
                      <div className="absolute left-[5px] top-4 w-0.5 h-full bg-gray-200"></div>
                    )}
                    
                    {/* 활동 내용 */}
                    <div className="space-y-2">
                      {/* 상단: 배지와 시간 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ActivityBadge type={activity.type} />
                          <span className="text-sm font-medium text-gray-700">{activity.user}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(activity.time).toLocaleString("ko-KR", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      {/* 하단: 제목 */}
                      <p className="text-sm text-gray-900 group-hover:text-[#FFC83D] transition-colors duration-200 leading-relaxed">
                        {activity.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3">최근 활동이 없습니다</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/admin/posts/new")}
                  className="text-xs"
                >
                  새 글 작성하기
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50/50 py-3 px-6 border-t">
            <Button 
              variant="link" 
              className="mx-auto text-xs text-gray-500 flex items-center hover:text-gray-700 transition-colors"
              onClick={() => router.push("/admin/posts")}
            >
              모든 활동 기록 보기 <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  )
}
