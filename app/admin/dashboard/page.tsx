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
  drafts: [
    { title: "여름철 건강관리 팁: 무더위 속 체력 유지하기", updatedAt: "2025-05-11T09:23:00Z", author: "pickteum1" },
    { title: "올림픽 메달 유망주 분석: 한국 선수단 전망", updatedAt: "2025-05-10T16:45:00Z", author: "pickteum2" },
  ],
  scheduled: [
    {
      title: "디지털 노마드 라이프스타일: 원격 근무의 장단점",
      scheduledAt: "2025-05-12T08:00:00Z",
      author: "pickteum1",
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
  recentActivity: [
    {
      type: "publish",
      title: "건강한 식습관으로 면역력 높이는 7가지 방법",
      time: "2025-05-10T09:00:00Z",
      user: "pickteum1",
    },
    {
      type: "edit",
      title: "2025 프로야구 시즌 전망: 주목해야 할 신인 선수들",
      time: "2025-05-09T14:15:00Z",
      user: "pickteum2",
    },
    {
      type: "draft",
      title: "여름철 건강관리 팁: 무더위 속 체력 유지하기",
      time: "2025-05-11T09:23:00Z",
      user: "pickteum1",
    },
    {
      type: "schedule",
      title: "디지털 노마드 라이프스타일: 원격 근무의 장단점",
      time: "2025-05-11T14:30:00Z",
      user: "pickteum1",
    },
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

// 활동 배지 컴포넌트
function ActivityBadge({ type }: { type: string }) {
  switch (type) {
    case "publish":
      return <Badge className="bg-green-500">발행</Badge>
    case "edit":
      return <Badge className="bg-blue-500">수정</Badge>
    case "draft":
      return (
        <Badge variant="outline" className="text-gray-500">
          초안
        </Badge>
      )
    case "schedule":
      return <Badge className="bg-purple-500">예약</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 로그인 상태 확인 - 실제 구현 시 토큰 검증 등으로 대체
    const user = localStorage.getItem("pickteum_user") || sessionStorage.getItem("pickteum_user")
    if (!user) {
      router.push("/admin/login")
      return
    }
    setUserName(user)

    // API 호출 시뮬레이션
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [router])

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

          {/* 할일 목록 */}
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
                    초안 ({MOCK_ANALYTICS.drafts.length})
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="flex-1">
                    예약 발행 ({MOCK_ANALYTICS.scheduled.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="drafts" className="space-y-4 min-h-[240px]">
                  {MOCK_ANALYTICS.drafts.length > 0 ? (
                    MOCK_ANALYTICS.drafts.map((draft, i) => (
                      <div key={i} className="flex items-start justify-between border-b pb-3 group">
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-[#FFC83D] transition-colors">
                            {draft.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>
                              {new Date(draft.updatedAt).toLocaleString("ko-KR", {
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
                        <Button variant="ghost" size="sm" className="h-8">
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
                  {MOCK_ANALYTICS.scheduled.length > 0 ? (
                    MOCK_ANALYTICS.scheduled.map((item, i) => (
                      <div key={i} className="flex items-start justify-between border-b pb-3 group">
                        <div className="flex-1">
                          <p className="text-sm font-medium group-hover:text-[#FFC83D] transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="flex items-center text-blue-600">
                              <Calendar size={12} className="mr-1" />
                              {new Date(item.scheduledAt).toLocaleString("ko-KR", {
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
                        <Button variant="ghost" size="sm" className="h-8">
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

        {/* 최근 활동 */}
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>관리자 활동 내역</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                모든 활동 보기
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l border-gray-200">
              {MOCK_ANALYTICS.recentActivity.map((activity, i) => (
                <div key={i} className="mb-6 relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-white border-2 border-[#FFC83D]"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2">
                      <ActivityBadge type={activity.type} />
                      <span className="text-sm font-medium">{activity.user}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString("ko-KR", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{activity.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 py-3 px-6 flex justify-center">
            <Button variant="link" className="text-sm text-gray-500 flex items-center">
              모든 활동 기록 보기 <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  )
}
