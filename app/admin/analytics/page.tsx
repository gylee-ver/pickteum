"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { ko } from "date-fns/locale"
import AdminLayout from "@/components/admin/layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, BarChart, PieChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Users,
} from "lucide-react"

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const MOCK_ANALYTICS = {
  overview: {
    visitors: {
      current: 12450,
      previous: 10890,
      change: 14.3,
    },
    pageviews: {
      current: 38900,
      previous: 35600,
      change: 9.3,
    },
    avgTime: {
      current: "2:34",
      previous: "2:21",
      change: 9.2,
    },
    bounceRate: {
      current: 42.5,
      previous: 45.8,
      change: -7.2,
    },
  },
  dailyVisitors: [
    { date: "05-01", visitors: 980 },
    { date: "05-02", visitors: 1050 },
    { date: "05-03", visitors: 1100 },
    { date: "05-04", visitors: 1030 },
    { date: "05-05", visitors: 1150 },
    { date: "05-06", visitors: 1200 },
    { date: "05-07", visitors: 1245 },
    { date: "05-08", visitors: 1180 },
    { date: "05-09", visitors: 1220 },
    { date: "05-10", visitors: 1300 },
    { date: "05-11", visitors: 1450 },
  ],
  deviceData: [
    { name: "모바일", value: 68 },
    { name: "데스크톱", value: 27 },
    { name: "태블릿", value: 5 },
  ],
  topContent: [
    {
      title: "건강한 식습관으로 면역력 높이는 7가지 방법",
      views: 5420,
      avgTime: "3:21",
      category: "건강",
      change: 12.5,
    },
    {
      title: "2025 프로야구 시즌 전망: 주목해야 할 신인 선수들",
      views: 4230,
      avgTime: "2:45",
      category: "스포츠",
      change: 8.3,
    },
    {
      title: "글로벌 경제 불확실성 속 투자 전략",
      views: 3870,
      avgTime: "4:12",
      category: "경제",
      change: -2.1,
    },
    {
      title: "최신 인공지능 기술이 바꾸는 일상생활",
      views: 3560,
      avgTime: "3:05",
      category: "테크",
      change: 15.7,
    },
    {
      title: "정부, 신규 주택 공급 정책 발표... 부동산 시장 영향은?",
      views: 2980,
      avgTime: "2:58",
      category: "정치/시사",
      change: 5.2,
    },
  ],
  categoryPerformance: [
    { name: "건강", views: 15420, articles: 12, avgTime: "3:05" },
    { name: "스포츠", views: 12350, articles: 10, avgTime: "2:48" },
    { name: "경제", views: 9870, articles: 8, avgTime: "3:22" },
    { name: "테크", views: 8560, articles: 7, avgTime: "2:55" },
    { name: "정치/시사", views: 6980, articles: 6, avgTime: "2:40" },
    { name: "라이프", views: 5420, articles: 5, avgTime: "2:35" },
  ],
  trafficSources: [
    { name: "직접 접속", value: 35 },
    { name: "검색 엔진", value: 30 },
    { name: "소셜 미디어", value: 20 },
    { name: "외부 링크", value: 10 },
    { name: "이메일", value: 5 },
  ],
  userRetention: [
    { name: "1일", newUsers: 100, returningUsers: 0 },
    { name: "2일", newUsers: 80, returningUsers: 20 },
    { name: "3일", newUsers: 60, returningUsers: 30 },
    { name: "4일", newUsers: 40, returningUsers: 40 },
    { name: "5일", newUsers: 30, returningUsers: 45 },
    { name: "6일", newUsers: 25, returningUsers: 50 },
    { name: "7일", newUsers: 20, returningUsers: 55 },
  ],
}

// 스켈레톤 로딩 컴포넌트
function AnalyticsSkeleton() {
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
  const TrendIcon = isPositive ? ArrowUp : ArrowDown
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
          {Math.abs(change).toFixed(1)}% {isPositive ? "증가" : "감소"}
        </p>
      </CardContent>
      <div className={`h-1 w-full ${isPositive ? "bg-green-500" : "bg-red-500"}`}></div>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [comparisonPeriod, setComparisonPeriod] = useState("previous")

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // 날짜 범위 변경 시 데이터 새로고침 (실제 구현 시 API 호출로 대체)
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      setIsLoading(true)

      // API 호출 시뮬레이션
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 800)

      return () => clearTimeout(timer)
    }
  }, [dateRange])

  // 날짜 범위 빠른 선택 옵션
  const handleQuickDateSelect = (option: string) => {
    const today = new Date()

    switch (option) {
      case "today":
        setDateRange({ from: today, to: today })
        break
      case "yesterday":
        const yesterday = subDays(today, 1)
        setDateRange({ from: yesterday, to: yesterday })
        break
      case "7days":
        setDateRange({ from: subDays(today, 6), to: today })
        break
      case "30days":
        setDateRange({ from: subDays(today, 29), to: today })
        break
      case "thisMonth":
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setDateRange({ from: firstDayOfMonth, to: today })
        break
      case "lastMonth":
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        setDateRange({ from: firstDayOfLastMonth, to: lastDayOfLastMonth })
        break
      default:
        break
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <AnalyticsSkeleton />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">통계 분석</h1>
          <p className="text-sm text-gray-500">사이트 트래픽과 콘텐츠 성과를 분석합니다.</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> 보고서 다운로드
        </Button>
      </div>

      {/* 날짜 범위 선택 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">기간 선택:</span>
              <DateRangePicker date={dateRange} onDateChange={setDateRange} locale={ko} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickDateSelect("today")}
              >
                오늘
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickDateSelect("yesterday")}
              >
                어제
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickDateSelect("7days")}
              >
                최근 7일
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickDateSelect("30days")}
              >
                최근 30일
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickDateSelect("thisMonth")}
              >
                이번 달
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => handleQuickDateSelect("lastMonth")}
              >
                지난 달
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">비교 기간:</span>
              <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="비교 기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">이전 기간</SelectItem>
                  <SelectItem value="lastYear">작년 동일 기간</SelectItem>
                  <SelectItem value="none">비교 없음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs flex items-center gap-1"
              onClick={() => {
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 800)
              }}
            >
              <RefreshCw className="h-3 w-3" /> 새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start rounded-md border bg-transparent p-0 h-auto">
          <TabsTrigger
            value="overview"
            className="rounded-l-md rounded-r-none border-r data-[state=active]:bg-[#FFC83D] data-[state=active]:text-white px-4 py-2"
          >
            개요
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="rounded-none border-r data-[state=active]:bg-[#FFC83D] data-[state=active]:text-white px-4 py-2"
          >
            콘텐츠 성과
          </TabsTrigger>
          <TabsTrigger
            value="audience"
            className="rounded-none border-r data-[state=active]:bg-[#FFC83D] data-[state=active]:text-white px-4 py-2"
          >
            사용자 분석
          </TabsTrigger>
          <TabsTrigger
            value="acquisition"
            className="rounded-r-md rounded-l-none data-[state=active]:bg-[#FFC83D] data-[state=active]:text-white px-4 py-2"
          >
            유입 경로
          </TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* 주요 지표 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="방문자"
              value={MOCK_ANALYTICS.overview.visitors.current.toLocaleString()}
              change={MOCK_ANALYTICS.overview.visitors.change}
              icon={Users}
              trend="up"
            />
            <StatCard
              title="페이지뷰"
              value={MOCK_ANALYTICS.overview.pageviews.current.toLocaleString()}
              change={MOCK_ANALYTICS.overview.pageviews.change}
              icon={FileText}
              trend="up"
            />
            <StatCard
              title="평균 체류시간"
              value={MOCK_ANALYTICS.overview.avgTime.current}
              change={MOCK_ANALYTICS.overview.avgTime.change}
              icon={Calendar}
              trend="up"
            />
            <StatCard
              title="이탈률"
              value={`${MOCK_ANALYTICS.overview.bounceRate.current}%`}
              change={MOCK_ANALYTICS.overview.bounceRate.change}
              icon={BarChart3}
              trend="down"
            />
          </div>

          {/* 방문자 추이 차트 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>방문자 추이</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    <ExternalLink size={14} /> 상세 보기
                  </Button>
                </div>
                <CardDescription>
                  {dateRange?.from && dateRange?.to
                    ? `${format(dateRange.from, "yyyy년 MM월 dd일", { locale: ko })} ~ ${format(
                        dateRange.to,
                        "yyyy년 MM월 dd일",
                        { locale: ko },
                      )}`
                    : "선택된 기간"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <LineChart
                    data={MOCK_ANALYTICS.dailyVisitors}
                    categories={["visitors"]}
                    index="date"
                    colors={["#FFC83D"]}
                    valueFormatter={(value) => `${value.toLocaleString()}`}
                    yAxisWidth={40}
                    showLegend={false}
                    showXAxis={true}
                    showYAxis={true}
                    showGridLines={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 디바이스 분포 차트 */}
            <Card className="lg:col-span-3 overflow-hidden transition-all hover:shadow-md">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <CardTitle>디바이스 분포</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    <ExternalLink size={14} /> 상세 보기
                  </Button>
                </div>
                <CardDescription>방문자 디바이스 유형</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <PieChart
                    data={MOCK_ANALYTICS.deviceData}
                    index="name"
                    valueFormatter={(value) => `${value}%`}
                    category="value"
                    colors={["#FFC83D", "#4CAF50", "#2196F3"]}
                    showAnimation={true}
                    showTooltip={true}
                    showLegend={true}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 인기 콘텐츠 */}
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>인기 콘텐츠</CardTitle>
                  <CardDescription>조회수 기준 상위 콘텐츠</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  전체 보기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        조회수
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        평균 체류시간
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        변화율
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ANALYTICS.topContent.map((content, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-6 text-center text-gray-500">{index + 1}</div>
                            <div className="ml-2 truncate max-w-[300px]" title={content.title}>
                              {content.title}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{content.category}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">{content.views.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{content.avgTime}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={content.change >= 0 ? "text-green-600" : "text-red-600"}>
                            {content.change >= 0 ? "+" : ""}
                            {content.change}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 콘텐츠 성과 탭 */}
        <TabsContent value="content" className="space-y-6 mt-0">
          {/* 카테고리별 성과 */}
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>카테고리별 성과</CardTitle>
                  <CardDescription>카테고리별 조회수 및 체류시간</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> 내보내기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <BarChart
                  data={MOCK_ANALYTICS.categoryPerformance}
                  index="name"
                  categories={["views"]}
                  colors={["#FFC83D"]}
                  valueFormatter={(value) => `${value.toLocaleString()}`}
                  showLegend={false}
                  showXAxis={true}
                  showYAxis={true}
                  showGridLines={true}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 p-4 border-t">
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">카테고리</th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">콘텐츠 수</th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">총 조회수</th>
                      <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">평균 체류시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ANALYTICS.categoryPerformance.map((category, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="py-2 px-4">{category.name}</td>
                        <td className="py-2 px-4 text-right">{category.articles}</td>
                        <td className="py-2 px-4 text-right">{category.views.toLocaleString()}</td>
                        <td className="py-2 px-4 text-right">{category.avgTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardFooter>
          </Card>

          {/* 콘텐츠 성과 분석 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>콘텐츠 길이와 체류시간 관계</CardTitle>
                <CardDescription>콘텐츠 길이에 따른 평균 체류시간 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm">데이터 준비 중...</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>콘텐츠 발행 시간 분석</CardTitle>
                <CardDescription>시간대별 콘텐츠 성과 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm">데이터 준비 중...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 사용자 분석 탭 */}
        <TabsContent value="audience" className="space-y-6 mt-0">
          {/* 사용자 유지율 */}
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>사용자 유지율</CardTitle>
                  <CardDescription>신규 및 재방문 사용자 비율</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> 내보내기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <BarChart
                  data={MOCK_ANALYTICS.userRetention}
                  index="name"
                  categories={["newUsers", "returningUsers"]}
                  colors={["#FFC83D", "#4CAF50"]}
                  valueFormatter={(value) => `${value}%`}
                  showLegend={true}
                  showXAxis={true}
                  showYAxis={true}
                  showGridLines={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* 사용자 행동 분석 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>사용자 행동 흐름</CardTitle>
                <CardDescription>페이지 간 이동 경로 분석</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm">데이터 준비 중...</p>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle>사용자 지역 분포</CardTitle>
                <CardDescription>지역별 방문자 분포</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 text-sm">데이터 준비 중...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 유입 경로 탭 */}
        <TabsContent value="acquisition" className="space-y-6 mt-0">
          {/* 트래픽 소스 */}
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>트래픽 소스</CardTitle>
                  <CardDescription>방문자 유입 경로 분석</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> 내보내기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <PieChart
                    data={MOCK_ANALYTICS.trafficSources}
                    index="name"
                    valueFormatter={(value) => `${value}%`}
                    category="value"
                    colors={["#FFC83D", "#4CAF50", "#2196F3", "#9C27B0", "#FF5722"]}
                    showAnimation={true}
                    showTooltip={true}
                    showLegend={true}
                  />
                </div>
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">소스</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">비율</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">방문자 수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ANALYTICS.trafficSources.map((source, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{source.name}</td>
                          <td className="py-3 px-4 text-right">{source.value}%</td>
                          <td className="py-3 px-4 text-right">
                            {Math.round(
                              (source.value / 100) * MOCK_ANALYTICS.overview.visitors.current,
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 소셜 미디어 분석 */}
          <Card className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>소셜 미디어 분석</CardTitle>
              <CardDescription>소셜 미디어별 유입 및 공유 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-gray-500 text-sm">데이터 준비 중...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
