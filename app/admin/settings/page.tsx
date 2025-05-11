"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Database,
  FileJson,
  Palette,
  BellRing,
  CloudUpload,
  Trash2,
  AlertTriangle,
  Info,
  Download,
} from "lucide-react"

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const MOCK_SETTINGS = {
  general: {
    siteName: "Pickteum(픽틈)",
    siteDescription: "모바일 퍼스트 콘텐츠 플랫폼",
    siteUrl: "https://pickteum.com",
    adminEmail: "admin@pickteum.com",
    logoUrl: "/logo.png",
    faviconUrl: "/favicon.ico",
    language: "ko",
    timezone: "Asia/Seoul",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm",
  },
  content: {
    postsPerPage: 10,
    excerptLength: 150,
    defaultCategory: "건강",
    allowComments: true,
    moderateComments: true,
    allowPingbacks: false,
    useMediaLibrary: true,
    maxUploadSize: 5, // MB
    allowedFileTypes: "jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,zip",
  },
  appearance: {
    theme: "light",
    primaryColor: "#FFC83D",
    secondaryColor: "#212121",
    fontFamily: "Pretendard, sans-serif",
    fontSize: "16px",
    enableDarkMode: true,
    customCss: "",
    customJs: "",
  },
  seo: {
    metaTitle: "Pickteum(픽틈) - 모바일 퍼스트 콘텐츠 플랫폼",
    metaDescription: "건강, 스포츠, 경제 등 다양한 주제의 콘텐츠를 제공하는 모바일 퍼스트 플랫폼입니다.",
    metaKeywords: "건강, 스포츠, 경제, 정치, 라이프, 테크, 콘텐츠, 모바일",
    googleAnalyticsId: "UA-XXXXXXXXX-X",
    googleTagManagerId: "GTM-XXXXXXX",
    naverSiteVerification: "",
    enableSitemap: true,
    enableRobotsTxt: true,
    enableOpenGraph: true,
    enableTwitterCards: true,
    enableStructuredData: true,
  },
  notifications: {
    enableEmailNotifications: true,
    notifyOnNewComment: true,
    notifyOnNewUser: true,
    notifyOnNewPost: false,
    adminEmailRecipients: "admin@pickteum.com",
    emailService: "smtp",
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUsername: "user@example.com",
    smtpPassword: "********",
    smtpEncryption: "tls",
  },
  security: {
    enableCaptcha: true,
    captchaType: "recaptcha",
    recaptchaSiteKey: "6LcXXXXXXXXXXXXXXXXXXXXX",
    recaptchaSecretKey: "6LcXXXXXXXXXXXXXXXXXXXXX",
    enableTwoFactor: false,
    loginAttempts: 5,
    lockoutTime: 30, // minutes
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: true,
  },
  advanced: {
    enableCache: true,
    cacheLifetime: 3600, // seconds
    debugMode: false,
    maintenanceMode: false,
    maintenanceMessage: "사이트가 현재 점검 중입니다. 잠시 후 다시 시도해주세요.",
    customHeadCode: "",
    customFooterCode: "",
  },
  backup: {
    lastBackup: "2025-05-01T09:00:00Z",
    backupSchedule: "daily",
    backupRetention: 7, // days
    backupLocation: "local",
  },
}

// 스켈레톤 로딩 컴포넌트
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <Skeleton className="h-12 w-full mb-6" />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(MOCK_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const { toast } = useToast()

  // 데이터 로딩 시뮬레이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  // 설정 변경 핸들러
  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  // 설정 저장 핸들러
  const handleSaveSettings = () => {
    setIsSaving(true)

    // 실제 구현 시 API 호출로 대체
    setTimeout(() => {
      setIsSaving(false)
      setHasChanges(false)
      setLastSaved(new Date().toLocaleTimeString())

      toast({
        title: "설정이 저장되었습니다.",
        description: `마지막 저장: ${new Date().toLocaleTimeString()}`,
      })
    }, 1000)
  }

  // 설정 초기화 핸들러
  const handleResetSettings = () => {
    if (window.confirm("모든 설정을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setSettings(MOCK_SETTINGS)
      setHasChanges(true)

      toast({
        title: "설정이 초기화되었습니다.",
        description: "모든 설정이 기본값으로 초기화되었습니다.",
      })
    }
  }

  // 백업 생성 핸들러
  const handleCreateBackup = () => {
    // 실제 구현 시 API 호출로 대체
    toast({
      title: "백업 생성 중...",
      description: "백업 파일을 생성하고 있습니다.",
    })

    setTimeout(() => {
      toast({
        title: "백업 생성 완료",
        description: "백업 파일이 성공적으로 생성되었습니다.",
      })

      // 백업 정보 업데이트
      setSettings((prev) => ({
        ...prev,
        backup: {
          ...prev.backup,
          lastBackup: new Date().toISOString(),
        },
      }))
    }, 2000)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <SettingsSkeleton />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-sm text-gray-500">사이트 설정을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && <span className="text-sm text-gray-500">마지막 저장: {lastSaved}</span>}
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> 초기화
          </Button>
          <Button
            className="bg-[#FFC83D] hover:bg-[#FFB800] shadow-sm transition-all"
            onClick={handleSaveSettings}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> 저장
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start rounded-md border bg-transparent p-0 h-auto overflow-x-auto flex-nowrap">
          <TabsTrigger
            value="general"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <Globe className="mr-2 h-4 w-4" /> 일반
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <FileJson className="mr-2 h-4 w-4" /> 콘텐츠
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <Palette className="mr-2 h-4 w-4" /> 외관
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <Globe className="mr-2 h-4 w-4" /> SEO
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <BellRing className="mr-2 h-4 w-4" /> 알림
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <Shield className="mr-2 h-4 w-4" /> 보안
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <Database className="mr-2 h-4 w-4" /> 고급
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
          >
            <CloudUpload className="mr-2 h-4 w-4" /> 백업
          </TabsTrigger>
        </TabsList>

        {/* 일반 설정 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>사이트 정보</CardTitle>
              <CardDescription>사이트의 기본 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">사이트 이름</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">사이트 URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) => handleSettingChange("general", "siteUrl", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">사이트 설명</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">관리자 이메일</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => handleSettingChange("general", "adminEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => handleSettingChange("general", "language", value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="언어 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">시간대</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => handleSettingChange("general", "timezone", value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="시간대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Seoul">아시아/서울 (GMT+9)</SelectItem>
                      <SelectItem value="America/New_York">미국/뉴욕 (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">유럽/런던 (GMT+0)</SelectItem>
                      <SelectItem value="Asia/Tokyo">아시아/도쿄 (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">날짜 형식</Label>
                  <Select
                    value={settings.general.dateFormat}
                    onValueChange={(value) => handleSettingChange("general", "dateFormat", value)}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="날짜 형식 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY년 MM월 DD일">YYYY년 MM월 DD일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>로고 및 파비콘</CardTitle>
              <CardDescription>사이트의 로고와 파비콘을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>로고</Label>
                  <div className="border rounded-md p-4 flex flex-col items-center">
                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                      <img
                        src={settings.general.logoUrl || "/placeholder.svg"}
                        alt="사이트 로고"
                        className="h-16 object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="w-full">
                        <CloudUpload className="mr-2 h-4 w-4" /> 업로드
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleSettingChange("general", "logoUrl", "/logo.png")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> 초기화
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>파비콘</Label>
                  <div className="border rounded-md p-4 flex flex-col items-center">
                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                      <img
                        src={settings.general.faviconUrl || "/placeholder.svg"}
                        alt="파비콘"
                        className="h-16 object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="w-full">
                        <CloudUpload className="mr-2 h-4 w-4" /> 업로드
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => handleSettingChange("general", "faviconUrl", "/favicon.ico")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" /> 초기화
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 콘텐츠 설정 */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>콘텐츠 표시</CardTitle>
              <CardDescription>콘텐츠 표시 방식을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postsPerPage">페이지당 게시물 수</Label>
                  <Input
                    id="postsPerPage"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.content.postsPerPage}
                    onChange={(e) => handleSettingChange("content", "postsPerPage", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerptLength">발췌 길이 (글자 수)</Label>
                  <Input
                    id="excerptLength"
                    type="number"
                    min="50"
                    max="500"
                    value={settings.content.excerptLength}
                    onChange={(e) => handleSettingChange("content", "excerptLength", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCategory">기본 카테고리</Label>
                <Select
                  value={settings.content.defaultCategory}
                  onValueChange={(value) => handleSettingChange("content", "defaultCategory", value)}
                >
                  <SelectTrigger id="defaultCategory">
                    <SelectValue placeholder="기본 카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="건강">건강</SelectItem>
                    <SelectItem value="스포츠">스포츠</SelectItem>
                    <SelectItem value="정치/시사">정치/시사</SelectItem>
                    <SelectItem value="경제">경제</SelectItem>
                    <SelectItem value="라이프">라이프</SelectItem>
                    <SelectItem value="테크">테크</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowComments" className="cursor-pointer">
                    댓글 허용
                  </Label>
                  <Switch
                    id="allowComments"
                    checked={settings.content.allowComments}
                    onCheckedChange={(checked) => handleSettingChange("content", "allowComments", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="moderateComments" className="cursor-pointer">
                    댓글 승인 필요
                  </Label>
                  <Switch
                    id="moderateComments"
                    checked={settings.content.moderateComments}
                    onCheckedChange={(checked) => handleSettingChange("content", "moderateComments", checked)}
                    disabled={!settings.content.allowComments}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allowPingbacks" className="cursor-pointer">
                    핑백 허용
                  </Label>
                  <Switch
                    id="allowPingbacks"
                    checked={settings.content.allowPingbacks}
                    onCheckedChange={(checked) => handleSettingChange("content", "allowPingbacks", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>미디어 설정</CardTitle>
              <CardDescription>미디어 라이브러리 및 업로드 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="useMediaLibrary" className="cursor-pointer">
                    미디어 라이브러리 사용
                  </Label>
                  <Switch
                    id="useMediaLibrary"
                    checked={settings.content.useMediaLibrary}
                    onCheckedChange={(checked) => handleSettingChange("content", "useMediaLibrary", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">최대 업로드 크기 (MB)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.content.maxUploadSize}
                    onChange={(e) => handleSettingChange("content", "maxUploadSize", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">허용된 파일 형식</Label>
                  <Input
                    id="allowedFileTypes"
                    value={settings.content.allowedFileTypes}
                    onChange={(e) => handleSettingChange("content", "allowedFileTypes", e.target.value)}
                  />
                  <p className="text-xs text-gray-500">쉼표로 구분된 파일 확장자 (예: jpg,png,pdf)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 외관 설정 */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>테마 설정</CardTitle>
              <CardDescription>사이트의 테마와 색상을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">기본 테마</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => handleSettingChange("appearance", "theme", value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="테마 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트 모드</SelectItem>
                      <SelectItem value="dark">다크 모드</SelectItem>
                      <SelectItem value="system">시스템 설정 따름</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableDarkMode" className="cursor-pointer">
                    다크 모드 지원
                  </Label>
                  <Switch
                    id="enableDarkMode"
                    checked={settings.appearance.enableDarkMode}
                    onCheckedChange={(checked) => handleSettingChange("appearance", "enableDarkMode", checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">주 색상</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: settings.appearance.primaryColor }}
                    ></div>
                    <Input
                      id="primaryColor"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => handleSettingChange("appearance", "primaryColor", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">보조 색상</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: settings.appearance.secondaryColor }}
                    ></div>
                    <Input
                      id="secondaryColor"
                      value={settings.appearance.secondaryColor}
                      onChange={(e) => handleSettingChange("appearance", "secondaryColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">글꼴</Label>
                  <Select
                    value={settings.appearance.fontFamily}
                    onValueChange={(value) => handleSettingChange("appearance", "fontFamily", value)}
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue placeholder="글꼴 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pretendard, sans-serif">Pretendard</SelectItem>
                      <SelectItem value="'Noto Sans KR', sans-serif">Noto Sans KR</SelectItem>
                      <SelectItem value="'Spoqa Han Sans Neo', sans-serif">Spoqa Han Sans Neo</SelectItem>
                      <SelectItem value="system-ui, sans-serif">시스템 글꼴</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontSize">기본 글자 크기</Label>
                  <Select
                    value={settings.appearance.fontSize}
                    onValueChange={(value) => handleSettingChange("appearance", "fontSize", value)}
                  >
                    <SelectTrigger id="fontSize">
                      <SelectValue placeholder="글자 크기 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14px">작게 (14px)</SelectItem>
                      <SelectItem value="16px">보통 (16px)</SelectItem>
                      <SelectItem value="18px">크게 (18px)</SelectItem>
                      <SelectItem value="20px">매우 크게 (20px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>커스텀 코드</CardTitle>
              <CardDescription>사이트에 커스텀 CSS 및 JavaScript를 추가합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customCss">커스텀 CSS</Label>
                <Textarea
                  id="customCss"
                  className="font-mono text-sm"
                  rows={6}
                  value={settings.appearance.customCss}
                  onChange={(e) => handleSettingChange("appearance", "customCss", e.target.value)}
                  placeholder="/* 여기에 커스텀 CSS를 입력하세요 */"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customJs">커스텀 JavaScript</Label>
                <Textarea
                  id="customJs"
                  className="font-mono text-sm"
                  rows={6}
                  value={settings.appearance.customJs}
                  onChange={(e) => handleSettingChange("appearance", "customJs", e.target.value)}
                  placeholder="// 여기에 커스텀 JavaScript를 입력하세요"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex items-center text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <p>커스텀 코드는 사이트 성능과 보안에 영향을 줄 수 있습니다. 신중하게 사용하세요.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SEO 설정 */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>메타 정보</CardTitle>
              <CardDescription>검색 엔진 최적화를 위한 메타 정보를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">메타 제목</Label>
                <Input
                  id="metaTitle"
                  value={settings.seo.metaTitle}
                  onChange={(e) => handleSettingChange("seo", "metaTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">메타 설명</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleSettingChange("seo", "metaDescription", e.target.value)}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">검색 결과에 표시될 설명</p>
                  <p
                    className={`text-xs ${settings.seo.metaDescription.length > 160 ? "text-red-500" : "text-gray-500"}`}
                  >
                    {settings.seo.metaDescription.length}/160
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">메타 키워드</Label>
                <Input
                  id="metaKeywords"
                  value={settings.seo.metaKeywords}
                  onChange={(e) => handleSettingChange("seo", "metaKeywords", e.target.value)}
                />
                <p className="text-xs text-gray-500">쉼표로 구분된 키워드</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>분석 도구</CardTitle>
              <CardDescription>웹 분석 도구 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => handleSettingChange("seo", "googleAnalyticsId", e.target.value)}
                    placeholder="UA-XXXXXXXXX-X 또는 G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManagerId"
                    value={settings.seo.googleTagManagerId}
                    onChange={(e) => handleSettingChange("seo", "googleTagManagerId", e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="naverSiteVerification">네이버 사이트 인증</Label>
                <Input
                  id="naverSiteVerification"
                  value={settings.seo.naverSiteVerification}
                  onChange={(e) => handleSettingChange("seo", "naverSiteVerification", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO 기능</CardTitle>
              <CardDescription>검색 엔진 최적화 기능을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSitemap" className="cursor-pointer">
                    사이트맵 생성
                  </Label>
                  <Switch
                    id="enableSitemap"
                    checked={settings.seo.enableSitemap}
                    onCheckedChange={(checked) => handleSettingChange("seo", "enableSitemap", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enableRobotsTxt" className="cursor-pointer">
                    robots.txt 생성
                  </Label>
                  <Switch
                    id="enableRobotsTxt"
                    checked={settings.seo.enableRobotsTxt}
                    onCheckedChange={(checked) => handleSettingChange("seo", "enableRobotsTxt", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enableOpenGraph" className="cursor-pointer">
                    Open Graph 메타태그
                  </Label>
                  <Switch
                    id="enableOpenGraph"
                    checked={settings.seo.enableOpenGraph}
                    onCheckedChange={(checked) => handleSettingChange("seo", "enableOpenGraph", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enableTwitterCards" className="cursor-pointer">
                    Twitter 카드 메타태그
                  </Label>
                  <Switch
                    id="enableTwitterCards"
                    checked={settings.seo.enableTwitterCards}
                    onCheckedChange={(checked) => handleSettingChange("seo", "enableTwitterCards", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enableStructuredData" className="cursor-pointer">
                    구조화된 데이터 (Schema.org)
                  </Label>
                  <Switch
                    id="enableStructuredData"
                    checked={settings.seo.enableStructuredData}
                    onCheckedChange={(checked) => handleSettingChange("seo", "enableStructuredData", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 알림 설정 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>이메일 알림</CardTitle>
              <CardDescription>이메일 알림 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableEmailNotifications" className="cursor-pointer">
                  이메일 알림 사용
                </Label>
                <Switch
                  id="enableEmailNotifications"
                  checked={settings.notifications.enableEmailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("notifications", "enableEmailNotifications", checked)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminEmailRecipients">관리자 이메일 수신자</Label>
                <Input
                  id="adminEmailRecipients"
                  value={settings.notifications.adminEmailRecipients}
                  onChange={(e) => handleSettingChange("notifications", "adminEmailRecipients", e.target.value)}
                  disabled={!settings.notifications.enableEmailNotifications}
                />
                <p className="text-xs text-gray-500">쉼표로 구분된 이메일 주소</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnNewComment" className="cursor-pointer">
                    새 댓글 알림
                  </Label>
                  <Switch
                    id="notifyOnNewComment"
                    checked={settings.notifications.notifyOnNewComment}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "notifyOnNewComment", checked)}
                    disabled={!settings.notifications.enableEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnNewUser" className="cursor-pointer">
                    새 사용자 알림
                  </Label>
                  <Switch
                    id="notifyOnNewUser"
                    checked={settings.notifications.notifyOnNewUser}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "notifyOnNewUser", checked)}
                    disabled={!settings.notifications.enableEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnNewPost" className="cursor-pointer">
                    새 게시물 알림
                  </Label>
                  <Switch
                    id="notifyOnNewPost"
                    checked={settings.notifications.notifyOnNewPost}
                    onCheckedChange={(checked) => handleSettingChange("notifications", "notifyOnNewPost", checked)}
                    disabled={!settings.notifications.enableEmailNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>이메일 서비스 설정</CardTitle>
              <CardDescription>이메일 발송을 위한 서비스 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailService">이메일 서비스</Label>
                <Select
                  value={settings.notifications.emailService}
                  onValueChange={(value) => handleSettingChange("notifications", "emailService", value)}
                  disabled={!settings.notifications.enableEmailNotifications}
                >
                  <SelectTrigger id="emailService">
                    <SelectValue placeholder="이메일 서비스 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.notifications.emailService === "smtp" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP 호스트</Label>
                      <Input
                        id="smtpHost"
                        value={settings.notifications.smtpHost}
                        onChange={(e) => handleSettingChange("notifications", "smtpHost", e.target.value)}
                        disabled={!settings.notifications.enableEmailNotifications}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP 포트</Label>
                      <Input
                        id="smtpPort"
                        value={settings.notifications.smtpPort}
                        onChange={(e) => handleSettingChange("notifications", "smtpPort", e.target.value)}
                        disabled={!settings.notifications.enableEmailNotifications}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP 사용자명</Label>
                      <Input
                        id="smtpUsername"
                        value={settings.notifications.smtpUsername}
                        onChange={(e) => handleSettingChange("notifications", "smtpUsername", e.target.value)}
                        disabled={!settings.notifications.enableEmailNotifications}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP 비밀번호</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.notifications.smtpPassword}
                        onChange={(e) => handleSettingChange("notifications", "smtpPassword", e.target.value)}
                        disabled={!settings.notifications.enableEmailNotifications}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpEncryption">암호화</Label>
                    <Select
                      value={settings.notifications.smtpEncryption}
                      onValueChange={(value) => handleSettingChange("notifications", "smtpEncryption", value)}
                      disabled={!settings.notifications.enableEmailNotifications}
                    >
                      <SelectTrigger id="smtpEncryption">
                        <SelectValue placeholder="암호화 방식 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">없음</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <Button
                variant="outline"
                className="ml-auto"
                disabled={!settings.notifications.enableEmailNotifications}
                onClick={() => {
                  toast({
                    title: "테스트 이메일 발송 중...",
                  })

                  setTimeout(() => {
                    toast({
                      title: "테스트 이메일 발송 완료",
                      description: "이메일이 성공적으로 발송되었습니다.",
                    })
                  }, 1500)
                }}
              >
                <Mail className="mr-2 h-4 w-4" /> 테스트 이메일 발송
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 보안 설정 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>보안 설정</CardTitle>
              <CardDescription>사이트의 보안 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableCaptcha" className="cursor-pointer">
                  CAPTCHA 사용
                </Label>
                <Switch
                  id="enableCaptcha"
                  checked={settings.security.enableCaptcha}
                  onCheckedChange={(checked) => handleSettingChange("security", "enableCaptcha", checked)}
                />
              </div>

              {settings.security.enableCaptcha && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="captchaType">CAPTCHA 유형</Label>
                    <Select
                      value={settings.security.captchaType}
                      onValueChange={(value) => handleSettingChange("security", "captchaType", value)}
                    >
                      <SelectTrigger id="captchaType">
                        <SelectValue placeholder="CAPTCHA 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recaptcha">Google reCAPTCHA</SelectItem>
                        <SelectItem value="hcaptcha">hCaptcha</SelectItem>
                        <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recaptchaSiteKey">사이트 키</Label>
                      <Input
                        id="recaptchaSiteKey"
                        value={settings.security.recaptchaSiteKey}
                        onChange={(e) => handleSettingChange("security", "recaptchaSiteKey", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recaptchaSecretKey">비밀 키</Label>
                      <Input
                        id="recaptchaSecretKey"
                        type="password"
                        value={settings.security.recaptchaSecretKey}
                        onChange={(e) => handleSettingChange("security", "recaptchaSecretKey", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="enableTwoFactor" className="cursor-pointer">
                  2단계 인증 사용
                </Label>
                <Switch
                  id="enableTwoFactor"
                  checked={settings.security.enableTwoFactor}
                  onCheckedChange={(checked) => handleSettingChange("security", "enableTwoFactor", checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">로그인 시도 제한</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.security.loginAttempts}
                    onChange={(e) => handleSettingChange("security", "loginAttempts", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutTime">계정 잠금 시간 (분)</Label>
                  <Input
                    id="lockoutTime"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.security.lockoutTime}
                    onChange={(e) => handleSettingChange("security", "lockoutTime", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>비밀번호 정책</CardTitle>
              <CardDescription>사용자 비밀번호 정책을 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">최소 길이</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="20"
                  value={settings.security.passwordMinLength}
                  onChange={(e) =>
                    handleSettingChange("security", "passwordMinLength", Number.parseInt(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="passwordRequireUppercase" className="cursor-pointer">
                    대문자 포함 필요
                  </Label>
                  <Switch
                    id="passwordRequireUppercase"
                    checked={settings.security.passwordRequireUppercase}
                    onCheckedChange={(checked) => handleSettingChange("security", "passwordRequireUppercase", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="passwordRequireNumber" className="cursor-pointer">
                    숫자 포함 필요
                  </Label>
                  <Switch
                    id="passwordRequireNumber"
                    checked={settings.security.passwordRequireNumber}
                    onCheckedChange={(checked) => handleSettingChange("security", "passwordRequireNumber", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="passwordRequireSpecial" className="cursor-pointer">
                    특수 문자 포함 필요
                  </Label>
                  <Switch
                    id="passwordRequireSpecial"
                    checked={settings.security.passwordRequireSpecial}
                    onCheckedChange={(checked) => handleSettingChange("security", "passwordRequireSpecial", checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex items-center text-sm text-blue-600">
                <Info className="h-4 w-4 mr-2" />
                <p>강력한 비밀번호 정책은 계정 보안을 강화합니다.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 고급 설정 */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>캐시 설정</CardTitle>
              <CardDescription>사이트 캐시 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableCache" className="cursor-pointer">
                  캐시 사용
                </Label>
                <Switch
                  id="enableCache"
                  checked={settings.advanced.enableCache}
                  onCheckedChange={(checked) => handleSettingChange("advanced", "enableCache", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheLifetime">캐시 수명 (초)</Label>
                <Input
                  id="cacheLifetime"
                  type="number"
                  min="60"
                  max="86400"
                  value={settings.advanced.cacheLifetime}
                  onChange={(e) => handleSettingChange("advanced", "cacheLifetime", Number.parseInt(e.target.value))}
                  disabled={!settings.advanced.enableCache}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "캐시 비우는 중...",
                  })

                  setTimeout(() => {
                    toast({
                      title: "캐시 비우기 완료",
                      description: "모든 캐시가 성공적으로 비워졌습니다.",
                    })
                  }, 1500)
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> 캐시 비우기
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>유지보수 모드</CardTitle>
              <CardDescription>사이트 유지보수 모드를 설정합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode" className="cursor-pointer">
                    유지보수 모드 활성화
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">활성화 시 일반 사용자는 사이트에 접근할 수 없습니다.</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.advanced.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange("advanced", "maintenanceMode", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">유지보수 메시지</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={settings.advanced.maintenanceMessage}
                  onChange={(e) => handleSettingChange("advanced", "maintenanceMessage", e.target.value)}
                  disabled={!settings.advanced.maintenanceMode}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>디버그 모드</CardTitle>
              <CardDescription>개발 및 디버깅 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debugMode" className="cursor-pointer">
                    디버그 모드 활성화
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">활성화 시 상세한 오류 정보가 표시됩니다.</p>
                </div>
                <Switch
                  id="debugMode"
                  checked={settings.advanced.debugMode}
                  onCheckedChange={(checked) => handleSettingChange("advanced", "debugMode", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customHeadCode">커스텀 Head 코드</Label>
                <Textarea
                  id="customHeadCode"
                  className="font-mono text-sm"
                  rows={4}
                  value={settings.advanced.customHeadCode}
                  onChange={(e) => handleSettingChange("advanced", "customHeadCode", e.target.value)}
                  placeholder="<!-- 여기에 HTML 코드를 입력하세요 -->"
                />
                <p className="text-xs text-gray-500">HTML &lt;head&gt; 태그 내에 삽입될 코드</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customFooterCode">커스텀 Footer 코드</Label>
                <Textarea
                  id="customFooterCode"
                  className="font-mono text-sm"
                  rows={4}
                  value={settings.advanced.customFooterCode}
                  onChange={(e) => handleSettingChange("advanced", "customFooterCode", e.target.value)}
                  placeholder="<!-- 여기에 HTML 코드를 입력하세요 -->"
                />
                <p className="text-xs text-gray-500">HTML &lt;body&gt; 태그 닫기 전에 삽입될 코드</p>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex items-center text-sm text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <p>이 설정들은 개발자 전용입니다. 잘못된 설정은 사이트 오류를 일으킬 수 있습니다.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* 백업 설정 */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>백업 설정</CardTitle>
              <CardDescription>사이트 백업 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md border">
                <div>
                  <p className="font-medium">마지막 백업</p>
                  <p className="text-sm text-gray-500">
                    {settings.backup.lastBackup
                      ? new Date(settings.backup.lastBackup).toLocaleString()
                      : "백업 기록 없음"}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 bg-green-50">
                  {settings.backup.backupSchedule === "daily"
                    ? "일일 백업"
                    : settings.backup.backupSchedule === "weekly"
                      ? "주간 백업"
                      : "월간 백업"}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupSchedule">백업 주기</Label>
                <Select
                  value={settings.backup.backupSchedule}
                  onValueChange={(value) => handleSettingChange("backup", "backupSchedule", value)}
                >
                  <SelectTrigger id="backupSchedule">
                    <SelectValue placeholder="백업 주기 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">매일</SelectItem>
                    <SelectItem value="weekly">매주</SelectItem>
                    <SelectItem value="monthly">매월</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupRetention">백업 보관 기간 (일)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.backup.backupRetention}
                  onChange={(e) => handleSettingChange("backup", "backupRetention", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupLocation">백업 저장 위치</Label>
                <Select
                  value={settings.backup.backupLocation}
                  onValueChange={(value) => handleSettingChange("backup", "backupLocation", value)}
                >
                  <SelectTrigger id="backupLocation">
                    <SelectValue placeholder="백업 위치 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">로컬 서버</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <Button onClick={handleCreateBackup}>
                  <CloudUpload className="mr-2 h-4 w-4" /> 지금 백업 생성
                </Button>

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> 최신 백업 다운로드
                </Button>

                <Button
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    if (window.confirm("정말로 모든 백업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
                      toast({
                        title: "백업 삭제 중...",
                      })

                      setTimeout(() => {
                        toast({
                          title: "백업 삭제 완료",
                          description: "모든 백업이 성공적으로 삭제되었습니다.",
                        })
                      }, 1500)
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> 모든 백업 삭제
                </Button>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="flex items-center text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <p>정기적인 백업은 데이터 손실을 방지하는 데 중요합니다.</p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
