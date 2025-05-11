"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Code, Eye, FileText, ImageIcon, Link, List, ListOrdered, Save, Type } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Bold, FolderOpen, Globe, Italic, Search } from "lucide-react"

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const CATEGORIES = [
  { name: "건강", color: "#4CAF50" },
  { name: "스포츠", color: "#2196F3" },
  { name: "정치/시사", color: "#9C27B0" },
  { name: "경제", color: "#FF9800" },
  { name: "라이프", color: "#FF5722" },
  { name: "테크", color: "#607D8B" },
]

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [tags, setTags] = useState("")
  const [slug, setSlug] = useState("")
  const [author, setAuthor] = useState("pickteum1")
  const [status, setStatus] = useState("draft")
  const [isPublished, setIsPublished] = useState(false)
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date())
  const [publishTime, setPublishTime] = useState("09:00")
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // 자동 저장 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      if (title || content) {
        handleAutoSave()
      }
    }, 30000) // 30초마다 자동 저장

    return () => clearInterval(timer)
  }, [title, content, category, status])

  // 자동 저장
  const handleAutoSave = () => {
    // 실제 구현 시 API 호출로 대체
    console.log("Auto saving...", { title, content, category, status })
    setLastSaved(new Date().toLocaleTimeString())
  }

  // 썸네일 업로드 처리
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "이미지 파일만 업로드 가능합니다.",
        description: "JPG, PNG, GIF 형식의 파일을 선택해주세요.",
      })
      return
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "파일 크기 초과",
        description: "5MB 이하의 이미지 파일을 선택해주세요.",
      })
      return
    }

    setThumbnailFile(file)

    // 이미지 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnail(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 저장 처리
  const handleSave = (publish = false) => {
    setIsSaving(true)

    // 필수 필드 검증
    if (!title) {
      toast({
        variant: "destructive",
        title: "제목을 입력해주세요.",
        description: "제목은 필수 입력 항목입니다.",
      })
      setIsSaving(false)
      return
    }

    if (!category) {
      toast({
        variant: "destructive",
        title: "카테고리를 선택해주세요.",
        description: "카테고리는 필수 선택 항목입니다.",
      })
      setIsSaving(false)
      return
    }

    // 발행 시 추가 검증
    if (publish && !content) {
      toast({
        variant: "destructive",
        title: "내용을 입력해주세요.",
        description: "발행하기 위해서는 내용이 필요합니다.",
      })
      setIsSaving(false)
      return
    }

    // 실제 구현 시 API 호출로 대체
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date().toLocaleTimeString())

      if (publish) {
        setIsPublished(true)
        setStatus("published")
        toast({
          title: "콘텐츠가 발행되었습니다.",
          description: "성공적으로 발행되었습니다.",
        })
      } else {
        toast({
          title: "저장되었습니다.",
          description: `마지막 저장: ${new Date().toLocaleTimeString()}`,
        })
      }

      // 저장 후 목록 페이지로 이동 (실제 구현 시 필요에 따라 조정)
      if (publish) {
        router.push("/admin/posts")
      }
    }, 1000)
  }

  // 예약 발행 처리
  const handleSchedule = () => {
    if (!publishDate) {
      toast({
        variant: "destructive",
        title: "발행 날짜를 선택해주세요.",
      })
      return
    }

    setStatus("scheduled")
    handleSave(false)

    toast({
      title: "발행이 예약되었습니다.",
      description: `${format(publishDate, "yyyy-MM-dd")} ${publishTime}에 발행됩니다.`,
    })
  }

  // 미리보기
  const handlePreview = () => {
    // 실제 구현 시 미리보기 페이지로 이동
    toast({
      title: "미리보기",
      description: "새 탭에서 미리보기가 열립니다.",
    })
  }

  // 취소
  const handleCancel = () => {
    if (title || content) {
      if (window.confirm("작성 중인 내용이 있습니다. 취소하시겠습니까?")) {
        router.push("/admin/posts")
      }
    } else {
      router.push("/admin/posts")
    }
  }

  // SEO 제목 자동 설정
  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(title)
    }
  }, [title, seoTitle])

  // 슬러그 자동 생성
  useEffect(() => {
    if (!slug && title) {
      // 한글, 영문, 숫자를 하이픈으로 변환하고 나머지는 제거
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      setSlug(generatedSlug)
    }
  }, [title, slug])

  return (
    <AdminLayout>
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 pb-4 border-b">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-4">새 아티클 작성</h1>
          {lastSaved && (
            <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              <Clock className="h-3 w-3 mr-1" />
              <span>마지막 저장: {lastSaved}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            취소
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" /> 미리보기
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="relative"
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                저장 중...
              </span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> 저장
              </>
            )}
          </Button>
          <Button
            className="bg-[#FFC83D] hover:bg-[#FFB800] text-black"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            {isSaving ? "처리 중..." : "발행하기"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 에디터 영역 */}
        <div className="flex-1">
          <div className="mb-6">
            <Input
              type="text"
              placeholder="제목을 입력하세요"
              className="text-3xl font-bold border-0 px-0 focus-visible:ring-0 mb-3 bg-transparent placeholder:text-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {category && (
              <div
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: CATEGORIES.find((cat) => cat.name === category)?.color + "20",
                  color: CATEGORIES.find((cat) => cat.name === category)?.color,
                }}
              >
                {category}
              </div>
            )}
          </div>

          {/* 에디터 툴바 */}
          <div className="flex flex-wrap items-center gap-1 mb-4 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center space-x-1 mr-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <Type size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <Bold size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <Italic size={16} />
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200"></div>

            <div className="flex items-center space-x-1 mx-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <List size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <ListOrdered size={16} />
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200"></div>

            <div className="flex items-center space-x-1 mx-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <Link size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <ImageIcon size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100">
                <Code size={16} />
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200 hidden sm:block"></div>

            <Button
              variant={isHtmlMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setIsHtmlMode(!isHtmlMode)}
              className="ml-auto rounded-md"
            >
              <FileText className="mr-2 h-4 w-4" /> HTML
            </Button>
          </div>

          {/* 에디터 본문 */}
          <div className="min-h-[500px] mb-6">
            <Textarea
              placeholder="내용을 입력하세요..."
              className="min-h-[500px] border rounded-lg p-4 focus-visible:ring-1 focus-visible:ring-[#FFC83D] resize-none font-sans shadow-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* 메타 정보 패널 */}
        <div className="w-full lg:w-80 space-y-6">
          {/* 발행 설정 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#FFC83D]" />
              발행 설정
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">초안</SelectItem>
                    <SelectItem value="published">발행</SelectItem>
                    <SelectItem value="scheduled">예약 발행</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "scheduled" && (
                <div className="space-y-2">
                  <Label>발행 일시</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !publishDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {publishDate ? format(publishDate, "PPP", { locale: ko }) : "날짜 선택"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={publishDate}
                          onSelect={setPublishDate}
                          initialFocus
                          locale={ko}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <Input
                        type="time"
                        value={publishTime}
                        onChange={(e) => setPublishTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSchedule}>
                    예약 발행 설정
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="author">작성자</Label>
                <Select value={author} onValueChange={setAuthor}>
                  <SelectTrigger>
                    <SelectValue placeholder="작성자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickteum1">pickteum1</SelectItem>
                    <SelectItem value="pickteum2">pickteum2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL 슬러그</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    /article/
                  </span>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-l-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 카테고리 및 태그 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-[#FFC83D]" />
              분류
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  placeholder="쉼표로 구분하여 입력"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <p className="text-xs text-gray-500">예: 건강, 다이어트, 식습관</p>
              </div>
            </div>
          </div>

          {/* 썸네일 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ImageIcon className="h-5 w-5 mr-2 text-[#FFC83D]" />
              썸네일
            </h3>

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                {thumbnail ? (
                  <div className="space-y-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 shadow-sm">
                      <Image
                        src={thumbnail || "/placeholder.svg"}
                        alt="썸네일 미리보기"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      <ImageIcon className="h-3 w-3 mr-1" /> 이미지 변경
                    </Button>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="text-sm font-medium text-gray-700">이미지를 드래그하거나 클릭하여 업로드</div>
                    <div className="mt-1 text-xs text-gray-500">권장 크기: 1200 x 630px (16:9)</div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailUpload}
                />
              </div>

              {thumbnail && (
                <div className="space-y-2">
                  <Label htmlFor="alt-text">대체 텍스트 (ALT)</Label>
                  <Input id="alt-text" placeholder="이미지 설명 입력" />
                  <p className="text-xs text-gray-500">검색 엔진과 스크린 리더를 위한 이미지 설명</p>
                </div>
              )}
            </div>
          </div>

          {/* SEO 설정 */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Search className="h-5 w-5 mr-2 text-[#FFC83D]" />
              SEO 설정
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO 제목</Label>
                <Input
                  id="seo-title"
                  placeholder="검색 결과에 표시될 제목"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">검색 결과에 표시될 제목</p>
                  <p className={`text-xs ${seoTitle.length > 60 ? "text-red-500" : "text-gray-500"}`}>
                    {seoTitle.length}/60
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO 설명</Label>
                <Textarea
                  id="seo-description"
                  placeholder="검색 결과에 표시될 설명"
                  className="h-20 resize-none"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
                <div className="flex justify-between">
                  <p className="text-xs text-gray-500">검색 결과에 표시될 설명</p>
                  <p className={`text-xs ${seoDescription.length > 160 ? "text-red-500" : "text-gray-500"}`}>
                    {seoDescription.length}/160
                  </p>
                </div>
              </div>

              {/* SEO 미리보기 */}
              <div className="mt-4 border rounded-lg p-4 bg-white shadow-inner">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Search className="h-3 w-3 mr-1" /> 검색 결과 미리보기
                </h4>
                <div className="space-y-1 p-3 bg-gray-50 rounded-md">
                  <div className="text-blue-600 text-base font-medium truncate hover:underline">
                    {seoTitle || title || "제목을 입력하세요"}
                  </div>
                  <div className="text-green-700 text-xs flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    https://pickteum.com/article/{slug || "url-slug"}
                  </div>
                  <div className="text-gray-600 text-sm line-clamp-2">
                    {seoDescription ||
                      "설명을 입력하세요. 이 텍스트는 검색 결과에서 페이지 내용을 요약하여 보여줍니다."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
