"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Code, Eye, FileText, ImageIcon, Link, List, ListOrdered, Save, Type, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Bold, FolderOpen, Globe, Italic, Search, Trash2 } from "lucide-react"
import { getStorageBucket } from "@/lib/supabase"
import supabase from "@/lib/supabase"

// 타입 정의
interface Category {
  id: string
  name: string
  color: string
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
}

// 모킹 데이터 - 실제 구현 시 API 호출로 대체
const CATEGORIES = [
  { name: "건강", color: "#4CAF50" },
  { name: "스포츠", color: "#2196F3" },
  { name: "정치/시사", color: "#9C27B0" },
  { name: "경제", color: "#FF9800" },
  { name: "라이프", color: "#FF5722" },
  { name: "테크", color: "#607D8B" },
]

// 🔥 카테고리별 작성자 매핑
const CATEGORY_AUTHOR_MAP: Record<string, string> = {
  "건강": "픽틈 헬스·라이프팀",
  "스포츠": "픽틈 스포츠이슈팀", 
  "정치/시사": "픽틈 정치·시사팀",
  "경제": "픽틈 경제·산업팀",
  "라이프": "픽틈 헬스·라이프팀",
  "테크": "픽틈 IT·테크팀",
}

export default function EditPostPage() {
  // URL 파라미터에서 ID 추출
  const params = useParams()
  const articleId = params.id as string

  // 상태 정의
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [tags, setTags] = useState("")
  const [slug, setSlug] = useState("")
  const [author, setAuthor] = useState("픽틈 스포츠이슈팀")
  const [status, setStatus] = useState("published")
  const [isPublished, setIsPublished] = useState(false)
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date())
  const [publishTime, setPublishTime] = useState("09:00")
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [originalArticle, setOriginalArticle] = useState<Article | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // 아티클 데이터 로드
  useEffect(() => {
    const loadArticleData = async () => {
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

        // 아티클 로드
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select(`
            *,
            category:categories(
              id,
              name,
              color
            )
          `)
          .eq('id', articleId)
          .single()

        if (articleError) {
          console.error('아티클 로드 오류:', articleError)
          throw articleError
        }

        if (!articleData) {
          throw new Error('아티클을 찾을 수 없습니다.')
        }

        // 상태에 데이터 설정
        setOriginalArticle(articleData)
        setTitle(articleData.title || "")
        setContent(articleData.content || "")
        setCategory(articleData.category?.name || "")
        setSeoTitle(articleData.seo_title || "")
        setSeoDescription(articleData.seo_description || "")
        setTags(articleData.tags ? articleData.tags.join(', ') : "")
        setSlug(articleData.slug || "")
        setAuthor(articleData.author || "픽틈 스포츠이슈팀")
        setStatus(articleData.status || "published")
        setThumbnail(articleData.thumbnail)
        
        // 발행 날짜/시간 설정
        if (articleData.published_at) {
          const publishDateTime = new Date(articleData.published_at)
          setPublishDate(publishDateTime)
          setPublishTime(format(publishDateTime, "HH:mm"))
          setIsPublished(articleData.status === 'published')
        }

        setCategories(categoriesData || [])

        toast({
          title: "아티클 로드 완료",
          description: "편집을 시작할 수 있습니다.",
        })

      } catch (error) {
        console.error('데이터 로드 실패:', error)
        setIsError(true)
        toast({
          variant: "destructive",
          title: "아티클 로드 실패",
          description: "아티클을 불러오는 중 오류가 발생했습니다.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (articleId) {
      loadArticleData()
    }
  }, [articleId])

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
  const handleAutoSave = async () => {
    if (!originalArticle) return
    
    try {
      const articleData = {
        title,
        content,
        category_id: categories.find(cat => cat.name === category)?.id || originalArticle.category_id,
        author,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
        status,
        seo_title: seoTitle || title,
        seo_description: seoDescription,
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        published_at: originalArticle.published_at || (status === 'published' ? new Date().toISOString() : null),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', articleId)

      if (error) {
        console.error('자동 저장 오류:', error)
        return
      }

      setLastSaved(new Date().toLocaleTimeString())
      console.log("Auto saved at:", new Date().toLocaleTimeString())
    } catch (error) {
      console.error('자동 저장 중 예외:', error)
    }
  }

  // === 리치 텍스트 에디터 함수들 ===
  
  // 텍스트 삽입 유틸리티 함수
  const insertText = (beforeText: string, afterText: string = "", defaultText: string = "") => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newText: string
    if (selectedText) {
      newText = beforeText + selectedText + afterText
    } else {
      newText = beforeText + defaultText + afterText
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)
    
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + beforeText.length, start + beforeText.length + selectedText.length)
      } else {
        textarea.setSelectionRange(start + beforeText.length, start + beforeText.length + defaultText.length)
      }
      textarea.focus()
    }, 0)
  }

  // 포맷팅 함수들
  const handleBold = () => insertText("**", "**", "볼드 텍스트")
  const handleItalic = () => insertText("*", "*", "이탤릭 텍스트")
  const handleCode = () => insertText("`", "`", "코드")

  const handleList = () => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      const lines = selectedText.split('\n')
      const newText = lines.map(line => line.trim() ? `- ${line.trim()}` : '').join('\n')
      insertText("", "", newText)
    } else {
      insertText("- ", "", "목록 항목")
    }
  }

  const handleOrderedList = () => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      const lines = selectedText.split('\n')
      const newText = lines.map((line, index) => 
        line.trim() ? `${index + 1}. ${line.trim()}` : ''
      ).join('\n')
      insertText("", "", newText)
    } else {
      insertText("1. ", "", "번호 목록 항목")
    }
  }

  const handleLink = () => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      const url = prompt("링크 URL을 입력하세요:")
      if (url) {
        insertText("[", `](${url})`, selectedText)
      }
    } else {
      const url = prompt("링크 URL을 입력하세요:")
      if (url) {
        insertText("[", `](${url})`, "링크 텍스트")
      }
    }
  }

  const handleImage = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "이미지 파일만 업로드 가능합니다.",
        description: "JPG, PNG, GIF 형식의 파일을 선택해주세요.",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "파일 크기 초과",
        description: "5MB 이하의 이미지 파일을 선택해주세요.",
      })
      return
    }

    try {
      toast({
        title: "이미지 업로드 중...",
        description: "잠시만 기다려주세요.",
      })

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      const bucket = await getStorageBucket('article-thumbnails')
      const { data: uploadData, error: uploadError } = await bucket.upload(filePath, file)

      if (uploadError) {
        console.error('이미지 업로드 오류:', uploadError)
        toast({
          variant: "destructive",
          title: "이미지 업로드 실패",
          description: "이미지 업로드 중 오류가 발생했습니다.",
        })
        return
      }

      const { data: publicUrlData } = bucket.getPublicUrl(filePath)
      const imageUrl = publicUrlData.publicUrl
      const altText = prompt("이미지 설명을 입력하세요 (선택사항):") || file.name.split('.')[0]
      
      insertText("![", `](${imageUrl})`, altText)

      toast({
        title: "이미지가 삽입되었습니다.",
        description: "이미지가 성공적으로 업로드되고 삽입되었습니다.",
      })

    } catch (uploadError) {
      console.error('이미지 업로드 예외:', uploadError)
      toast({
        variant: "destructive",
        title: "이미지 업로드 실패",
        description: "이미지 업로드 중 예상치 못한 오류가 발생했습니다.",
      })
    }

    if (e.target) {
      e.target.value = ''
    }
  }

  // 썸네일 업로드 처리
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 🔥 파일 정보 저장
    setThumbnailFile(file)

    // 🔥 미리보기용 base64 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 🔥 즉시 Supabase에 업로드하여 실제 URL 생성
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('article-thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('썸네일 업로드 오류:', uploadError)
        toast({
          variant: "destructive",
          title: "썸네일 업로드 실패",
          description: "썸네일 이미지 업로드 중 오류가 발생했습니다.",
        })
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('article-thumbnails')
        .getPublicUrl(filePath)
      
      setThumbnail(publicUrlData.publicUrl)
      console.log('✅ 썸네일 업로드 성공:', publicUrlData.publicUrl)
      
      toast({
        title: "썸네일 업로드 완료",
        description: "이미지가 성공적으로 업로드되었습니다.",
      })
    } catch (uploadError) {
      console.error('썸네일 업로드 예외:', uploadError)
      toast({
        variant: "destructive",
        title: "썸네일 업로드 실패",
        description: "썸네일 이미지 업로드 중 예외가 발생했습니다.",
      })
    }
  }

  // 저장 처리 (UPDATE)
  const handleSave = async (publish = false, forceStatus?: string, scheduledTime?: string) => {
    if (!originalArticle) return

    // 🔥 Base64 데이터 검증 - 절대 저장하지 않음
    if (thumbnailPreview && thumbnailPreview.startsWith('data:image/') && !thumbnail) {
      toast({
        variant: "destructive",
        title: "썸네일 업로드 필요",
        description: "이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.",
      })
      setIsSaving(false)
      return
    }

    setIsSaving(true)

    try {
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

      if (publish && !content) {
        toast({
          variant: "destructive",
          title: "내용을 입력해주세요.",
          description: "발행하기 위해서는 내용이 필요합니다.",
        })
        setIsSaving(false)
        return
      }

      // 🔥 실제 썸네일 URL만 사용 (이미 업로드 완료된 URL 또는 기존 URL)
      const finalThumbnailUrl = thumbnail || originalArticle.thumbnail || null

      // 카테고리 ID 찾기
      const selectedCategory = categories.find(cat => cat.name === category)
      const categoryId = selectedCategory ? selectedCategory.id : originalArticle.category_id

      // Article 데이터 준비
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        author: author || originalArticle.author || '픽틈 스포츠이슈팀',
        slug: slug || title.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""),
        status: forceStatus || (publish ? 'published' : status),
        thumbnail: finalThumbnailUrl, // 🔥 실제 URL만 저장
        seo_title: seoTitle || title,
        seo_description: seoDescription || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        published_at: scheduledTime || originalArticle.published_at || (publish ? new Date().toISOString() : null),
        updated_at: new Date().toISOString()
      }

      console.log('수정할 아티클 데이터:', articleData)

      // 발행 또는 예약 변경은 서버 API 우선(서비스 롤)으로 처리하여 RLS 영향 회피
      let updateData: any = null
      if (publish || forceStatus) {
        const res = await fetch('/api/admin/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: articleId, data: articleData })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          toast({
            variant: 'destructive',
            title: '저장 실패',
            description: `서버 저장 실패: ${err.error || res.statusText}`,
          })
          setIsSaving(false)
          return
        }
        const json = await res.json()
        updateData = json.data
      } else {
        // 일반 저장은 기존대로 클라이언트 Supabase 우선 시도
        let updateError: any = null
        try {
          const { data, error } = await supabase
            .from('articles')
            .update(articleData)
            .eq('id', articleId)
            .select()
            .single()
          updateData = data
          updateError = error
        } catch (e: any) {
          updateError = e
        }

        // 실패 시 서버 API 폴백
        if (updateError) {
          const msg = updateError?.message || ''
          const code = updateError?.code || ''
          const isPermissionIssue = /permission|rls|401|403|42501/i.test(msg) || /42501|PGRST/i.test(code)
          if (isPermissionIssue) {
            const res = await fetch('/api/admin/articles', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: articleId, data: articleData })
            })
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              toast({
                variant: 'destructive',
                title: '저장 실패',
                description: `서버 저장 실패: ${err.error || res.statusText}`,
              })
              setIsSaving(false)
              return
            }
            const json = await res.json()
            updateData = json.data
          } else {
            console.error('아티클 수정 오류:', updateError)
            toast({
              variant: 'destructive',
              title: '저장 실패',
              description: `아티클 수정 중 오류가 발생했습니다: ${msg}`,
            })
            setIsSaving(false)
            return
          }
        }
      }

      console.log('아티클 수정 성공:', updateData)
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

      // 저장 후 목록 페이지로 이동
      if (publish) {
        router.push("/admin/posts")
      }

    } catch (error) {
      console.error('저장 중 예외 발생:', error)
      toast({
        variant: "destructive",
        title: "저장 실패",
        description: "저장 중 예상치 못한 오류가 발생했습니다.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 아티클 삭제
  const handleDelete = async () => {
    if (!window.confirm("이 아티클을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
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
          description: "아티클 삭제 중 오류가 발생했습니다.",
        })
        return
      }

      toast({
        title: "삭제 완료",
        description: "아티클이 삭제되었습니다.",
      })

      router.push("/admin/posts")

    } catch (error) {
      console.error('삭제 중 예외:', error)
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: "삭제 중 예상치 못한 오류가 발생했습니다.",
      })
    }
  }

  // 예약 발행 처리
  const handleSchedule = async () => {
    if (!publishDate) {
      toast({
        variant: "destructive",
        title: "발행 날짜를 선택해주세요.",
      })
      return
    }

    if (!publishTime) {
      toast({
        variant: "destructive", 
        title: "발행 시간을 선택해주세요.",
      })
      return
    }

    // 예약 날짜와 시간을 결합하여 ISO 문자열 생성
    const scheduledDateTime = new Date(`${format(publishDate, "yyyy-MM-dd")}T${publishTime}:00`)
    
    // 현재 시간보다 미래인지 확인
    if (scheduledDateTime <= new Date()) {
      toast({
        variant: "destructive",
        title: "예약 시간이 현재 시간보다 이후여야 합니다.",
      })
      return
    }

    // 기존 handleSave 로직을 사용하되 스케줄 모드로
    await handleSave(false, 'scheduled', scheduledDateTime.toISOString())
    
    // 성공 시 토스트와 페이지 이동
    toast({
      title: "발행이 예약되었습니다.",
      description: `${format(publishDate, "yyyy-MM-dd")} ${publishTime}에 발행됩니다.`,
    })

    setTimeout(() => {
      router.push("/admin/posts")
    }, 1500)
  }

  // 🔥 개선된 미리보기 함수
  const handlePreview = () => {
    // 필수 필드 검증
    if (!title.trim()) {
      toast({
        title: "미리보기 오류",
        description: "제목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "미리보기 오류", 
        description: "내용을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 카테고리 색상 찾기
    const selectedCategory = categories.find(cat => cat.name === category)
    const categoryColor = selectedCategory?.color || '#cccccc'

    // 미리보기 데이터 준비
    const previewData = {
      title,
      content,
      category: category || '미분류',
      categoryColor,
      author,
      thumbnail,
      publishDate: publishDate ? format(publishDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      publishTime,
      tags,
      altText: thumbnail ? `${title} 썸네일` : ''
    }

    // 🔥 새 탭에서 미리보기 열기 (기존 OG 메타 기능 보존)
    const previewUrl = `/admin/preview?data=${encodeURIComponent(JSON.stringify(previewData))}`
    window.open(previewUrl, '_blank', 'noopener,noreferrer')

    toast({
      title: "미리보기",
      description: "새 탭에서 미리보기가 열렸습니다.",
    })
  }

  // 취소
  const handleCancel = () => {
    if (window.confirm("편집을 취소하시겠습니까? 저장하지 않은 변경사항은 사라집니다.")) {
      router.push("/admin/posts")
    }
  }

  // SEO 제목 자동 설정
  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(title)
    }
  }, [title, seoTitle])

  // 슬러그 자동 생성 (편집 모드에서는 기존 슬러그 유지)
  useEffect(() => {
    if (!slug && title && !originalArticle?.slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      setSlug(generatedSlug)
    }
  }, [title, slug, originalArticle])

  // 🔥 카테고리 변경 시 작성자 자동 설정 함수
  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory)
    
    // 카테고리에 맞는 작성자 자동 설정 (기존 작성자와 다른 경우에만)
    const defaultAuthor = CATEGORY_AUTHOR_MAP[selectedCategory]
    if (defaultAuthor && defaultAuthor !== author) {
      setAuthor(defaultAuthor)
      
      // 사용자에게 알림
      toast({
        title: "작성자 자동 변경",
        description: `${selectedCategory} 카테고리에 맞게 작성자가 "${defaultAuthor}"로 변경되었습니다.`,
        duration: 3000,
      })
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#FFC83D] mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">아티클 로드 중...</h3>
          <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
      </AdminLayout>
    )
  }

  // 에러 상태
  if (isError || !originalArticle) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">아티클을 찾을 수 없습니다</h3>
          <p className="text-gray-500 mb-4">요청한 아티클이 존재하지 않거나 접근할 수 없습니다.</p>
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            목록으로 돌아가기
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6 sticky top-0 z-10 pb-4 border-b">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold mr-4">아티클 편집</h1>
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" /> 삭제
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
                  backgroundColor: categories.find((cat) => cat.name === category)?.color + "20",
                  color: categories.find((cat) => cat.name === category)?.color,
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
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleBold}>
                <Bold size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleItalic}>
                <Italic size={16} />
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200"></div>

            <div className="flex items-center space-x-1 mx-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleList}>
                <List size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleOrderedList}>
                <ListOrdered size={16} />
              </Button>
            </div>

            <div className="h-6 border-r border-gray-200"></div>

            <div className="flex items-center space-x-1 mx-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleLink}>
                <Link size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleImage}>
                <ImageIcon size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-gray-100" onClick={handleCode}>
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
              ref={textareaRef}
              placeholder="내용을 입력하세요..."
              className="min-h-[500px] border rounded-lg p-4 focus-visible:ring-1 focus-visible:ring-[#FFC83D] resize-none font-sans shadow-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* 메타 정보 패널 - 나머지는 새 글 작성과 동일 */}
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
                    <SelectItem value="published">발행</SelectItem>
                    <SelectItem value="scheduled">예약 발행</SelectItem>
                    <SelectItem value="draft">초안</SelectItem>
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
                    <SelectItem value="픽틈 헬스·라이프팀">픽틈 헬스·라이프팀</SelectItem>
                    <SelectItem value="픽틈 스포츠이슈팀">픽틈 스포츠이슈팀</SelectItem>
                    <SelectItem value="픽틈 정치·시사팀">픽틈 정치·시사팀</SelectItem>
                    <SelectItem value="픽틈 경제·산업팀">픽틈 경제·산업팀</SelectItem>
                    <SelectItem value="픽틈 IT·테크팀">픽틈 IT·테크팀</SelectItem>
                  </SelectContent>
                </Select>
                {/* 🔥 자동 설정 안내 텍스트 추가 */}
                <p className="text-xs text-gray-500">
                  카테고리 변경 시 자동으로 해당 팀 작성자가 설정됩니다.
                </p>
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
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
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
                {/* 콘텐츠 이미지 업로드용 숨겨진 input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
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