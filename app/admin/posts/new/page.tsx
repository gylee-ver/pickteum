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
import { useStorageBucket } from "@/lib/supabase"
import supabase from "@/lib/supabase"
import { ImageAltTipsModal } from "@/components/admin/ImageAltTipsModal"
import { HelpCircle } from "lucide-react"
import { SaveConfirmModal } from "@/components/admin/SaveConfirmModal"
import { ImagePreviewModal } from "@/components/admin/ImagePreviewModal"

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

export default function NewPostPage() {
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
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [altText, setAltText] = useState("")
  const [showAltTips, setShowAltTips] = useState(false)
  const [isAltRequired, setIsAltRequired] = useState(false)
  const [savedArticleId, setSavedArticleId] = useState<string | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [pendingImageUrl, setPendingImageUrl] = useState('')
  const [pendingFileName, setPendingFileName] = useState('')
  const [pendingImagePath, setPendingImagePath] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // 🔥 카테고리 변경 시 작성자 자동 설정 함수
  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory)
    
    // 카테고리에 맞는 작성자 자동 설정
    const defaultAuthor = CATEGORY_AUTHOR_MAP[selectedCategory]
    if (defaultAuthor) {
      setAuthor(defaultAuthor)
      
      // 사용자에게 알림
      toast({
        title: "작성자 자동 설정",
        description: `${selectedCategory} 카테고리에 맞게 작성자가 "${defaultAuthor}"로 설정되었습니다.`,
        duration: 3000,
      })
    }
  }

  // 카테고리 데이터 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
        
        if (error) {
          console.error('카테고리 로드 오류:', error)
          // 오류 시 기본 카테고리 생성 시도
          await createDefaultCategories()
          return
        }
        
        console.log('로드된 카테고리:', data)
        
        // 카테고리가 없으면 기본 카테고리 생성
        if (!data || data.length === 0) {
          console.log('카테고리가 없어 기본 카테고리를 생성합니다.')
          await createDefaultCategories()
          return
        }
        
        setCategories(data)
      } catch (err) {
        console.error('카테고리 로드 중 예외:', err)
        // 오류 시 기본 카테고리 사용
        setCategories(CATEGORIES.map((cat, index) => ({ id: index + 1, ...cat })))
      }
    }
    
    // 기본 카테고리 생성 함수
    const createDefaultCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert(CATEGORIES)
          .select()
        
        if (error) {
          console.error('기본 카테고리 생성 오류:', error)
          // 생성 실패 시 임시 카테고리 사용
          setCategories(CATEGORIES.map((cat, index) => ({ id: index + 1, ...cat })))
          return
        }
        
        console.log('기본 카테고리 생성 완료:', data)
        setCategories(data)
        
        toast({
          title: "초기 설정 완료",
          description: "기본 카테고리가 생성되었습니다.",
        })
      } catch (err) {
        console.error('기본 카테고리 생성 중 예외:', err)
        setCategories(CATEGORIES.map((cat, index) => ({ id: index + 1, ...cat })))
      }
    }
    
    loadCategories()
  }, [])

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
      // 선택된 텍스트가 있으면 앞뒤로 감싸기
      newText = beforeText + selectedText + afterText
    } else {
      // 선택된 텍스트가 없으면 기본 텍스트 사용
      newText = beforeText + defaultText + afterText
    }
    
    const newContent = content.substring(0, start) + newText + content.substring(end)
    setContent(newContent)
    
    // 커서 위치 조정
    setTimeout(() => {
      if (selectedText) {
        textarea.setSelectionRange(start + beforeText.length, start + beforeText.length + selectedText.length)
      } else {
        textarea.setSelectionRange(start + beforeText.length, start + beforeText.length + defaultText.length)
      }
      textarea.focus()
    }, 0)
  }

  // 볼드 처리
  const handleBold = () => {
    insertText("**", "**", "볼드 텍스트")
  }

  // 이탤릭 처리
  const handleItalic = () => {
    insertText("*", "*", "이탤릭 텍스트")
  }

  // 일반 목록 처리
  const handleList = () => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      // 선택된 텍스트를 줄별로 나누어 각 줄에 - 추가
      const lines = selectedText.split('\n')
      const newText = lines.map(line => line.trim() ? `- ${line.trim()}` : '').join('\n')
      insertText("", "", newText)
    } else {
      insertText("- ", "", "목록 항목")
    }
  }

  // 번호 목록 처리
  const handleOrderedList = () => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      // 선택된 텍스트를 줄별로 나누어 각 줄에 번호 추가
      const lines = selectedText.split('\n')
      const newText = lines.map((line, index) => 
        line.trim() ? `${index + 1}. ${line.trim()}` : ''
      ).join('\n')
      insertText("", "", newText)
    } else {
      insertText("1. ", "", "번호 목록 항목")
    }
  }

  // 링크 처리
  const handleLink = () => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      // 선택된 텍스트를 링크 텍스트로 사용
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

  // 이미지 처리 (로컬 파일 업로드)
  const handleImage = () => {
    imageInputRef.current?.click()
  }

  // 🔥 개선된 이미지 파일 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      toast({
        title: "이미지 업로드 중...",
        description: "잠시만 기다려주세요.",
      })

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `images/${fileName}`

      const bucket = await useStorageBucket('article-thumbnails')
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
      
      // 🔥 미리보기 모달 표시를 위해 상태 설정
      setPendingImageUrl(imageUrl)
      setPendingFileName(file.name)
      setPendingImagePath(filePath)
      setShowImagePreview(true)

      toast({
        title: "업로드 완료",
        description: "이미지 설명을 입력해주세요.",
      })

    } catch (error) {
      console.error('이미지 업로드 예외:', error)
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

  // 🔥 이미지 삽입 확인 처리
  const handleImageInsert = async (altText: string) => {
    try {
      if (!pendingImageUrl || !altText.trim()) {
        return
      }

      // 에디터에 이미지 마크다운 삽입
      insertText("![", `](${pendingImageUrl})`, altText)

      toast({
        title: "이미지가 삽입되었습니다.",
        description: "이미지가 성공적으로 삽입되었습니다.",
      })

      // 상태 초기화
      setPendingImageUrl('')
      setPendingFileName('')
      setPendingImagePath('')

    } catch (error) {
      console.error('이미지 삽입 오류:', error)
      toast({
        variant: "destructive",
        title: "이미지 삽입 실패",
        description: "이미지 삽입 중 오류가 발생했습니다.",
      })
    }
  }

  // 🔥 이미지 삽입 취소 처리
  const handleImageCancel = async () => {
    try {
      // 업로드된 이미지 파일 삭제
      if (pendingImagePath) {
        const { error } = await supabase.storage
          .from('article-thumbnails')
          .remove([pendingImagePath])
        
        if (error) {
          console.error('이미지 삭제 오류:', error)
        }
      }

      // 상태 초기화
      setPendingImageUrl('')
      setPendingFileName('')
      setPendingImagePath('')

      toast({
        title: "이미지 삽입 취소",
        description: "업로드된 이미지가 삭제되었습니다.",
      })

    } catch (error) {
      console.error('이미지 삭제 오류:', error)
    }
  }

  // 인라인 코드 처리
  const handleCode = () => {
    insertText("`", "`", "코드")
  }

  // 코드 블록 처리
  const handleCodeBlock = () => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    if (selectedText) {
      // 선택된 텍스트를 코드 블록으로 감싸기
      insertText("```\n", "\n```", selectedText)
    } else {
      insertText("```\n", "\n```", "코드 블록")
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

    // 🔥 파일 정보 저장 (실제 업로드용)
    setThumbnailFile(file)

    // 🔥 미리보기용 base64 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string)
      setIsAltRequired(true) // 썸네일 업로드 시 alt 텍스트 필수화
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
      
      setThumbnailUrl(publicUrlData.publicUrl)
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

  // slug 중복 체크 및 고유한 slug 생성 함수
  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let finalSlug = baseSlug
    let counter = 1

    while (true) {
      // 현재 slug가 이미 존재하는지 확인
      const { data: existingArticle, error } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', finalSlug)
        .single()

      // 에러가 발생했다면 (데이터가 없다면) 해당 slug 사용 가능
      if (error && error.code === 'PGRST116') {
        return finalSlug
      }

      // 데이터가 존재한다면 숫자를 붙여서 다시 시도
      if (existingArticle) {
        finalSlug = `${baseSlug}-${counter}`
        counter++
      } else {
        return finalSlug
      }

      // 무한 루프 방지 (최대 100번 시도)
      if (counter > 100) {
        finalSlug = `${baseSlug}-${Date.now()}`
        return finalSlug
      }
    }
  }

  // 저장 처리
  const handleSave = async (publish = false, force = false) => {
    // 🔥 Base64 데이터 검증 - 절대 저장하지 않음
    if (thumbnailPreview && thumbnailPreview.startsWith('data:image/') && !thumbnailUrl) {
      toast({
        variant: "destructive",
        title: "썸네일 업로드 필요",
        description: "이미지 업로드가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.",
      })
      setIsSaving(false)
      return
    }

    // alt 텍스트 검증
    if (thumbnailUrl && !altText.trim()) {
      toast({
        variant: "destructive",
        title: "alt 텍스트 필수",
        description: "썸네일 이미지의 대체 텍스트를 입력해주세요.",
      })
      return
    }

    // 발행하기인데 이미 저장된 초안이 있는 경우 (force가 아닐 때만)
    if (publish && savedArticleId && !force) {
      setShowPublishModal(true)
      return
    }

    setIsSaving(true)

    try {
      // 필수 필드 검증
      if (!title.trim()) {
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

      if (publish && !content.trim()) {
        toast({
          variant: "destructive",
          title: "내용을 입력해주세요.",
          description: "발행하기 위해서는 내용이 필요합니다.",
        })
        setIsSaving(false)
        return
      }

      // 🔥 실제 썸네일 URL만 사용 (base64 절대 저장 안함)
      const finalThumbnailUrl = thumbnailUrl || null

      // 카테고리 ID 찾기
      const selectedCategory = categories.find(cat => cat.name === category)
      const categoryId = selectedCategory?.id

      if (!categoryId) {
        toast({
          variant: "destructive",
          title: "카테고리 오류",
          description: "선택한 카테고리를 찾을 수 없습니다.",
        })
        setIsSaving(false)
        return
      }

      // 기본 slug 생성 (저장된 아티클이 없는 경우에만)
      let uniqueSlug = slug
      if (!savedArticleId) {
        const baseSlug = slug || title.toLowerCase()
          .replace(/[^a-z0-9가-힣\s]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")

        uniqueSlug = await generateUniqueSlug(baseSlug)
      }

      // Article 데이터 준비
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        author: author || '픽틈 스포츠이슈팀',
        slug: uniqueSlug,
        status: publish ? 'published' : 'draft',
        thumbnail: finalThumbnailUrl, // 🔥 실제 URL만 저장
        thumbnail_alt: altText.trim() || null,
        seo_title: seoTitle || title,
        seo_description: seoDescription || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        published_at: publish ? new Date().toISOString() : null,
        views: 0
      }

      console.log('저장할 아티클 데이터:', JSON.stringify(articleData, null, 2))
      console.log('savedArticleId:', savedArticleId)

      let result

      if (savedArticleId) {
        // 기존 아티클 업데이트
        console.log('기존 아티클 업데이트 중...')
        const { data, error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', savedArticleId)
          .select()
          .single()

        result = { data, error }
      } else {
        // 새 아티클 생성
        console.log('새 아티클 생성 중...')
        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select()
          .single()

        result = { data, error }
      }

      if (result.error) {
        console.error('==== Supabase 에러 상세 정보 ====')
        console.error('전체 에러 객체:', JSON.stringify(result.error, null, 2))
        console.error('================================')
        
        toast({
          variant: "destructive",
          title: "저장 실패",
          description: `아티클 저장 중 오류가 발생했습니다: ${result.error.message}`,
        })
        
        setIsSaving(false)
        return
      }

      // 성공 시 처리
      if (!savedArticleId) {
        setSavedArticleId(result.data.id)
        setSlug(uniqueSlug)
      }

      console.log(`아티클 ${publish ? '발행' : '저장'} 성공:`, result.data)

      setIsSaving(false)

      if (publish) {
        toast({
          title: "발행 완료!",
          description: "아티클이 성공적으로 발행되었습니다.",
        })
        
        // 발행 후 페이지 이동
        setTimeout(() => {
          router.push('/admin/posts')
        }, 1500)
      } else {
        // 저장 완료 모달 표시
        setShowSaveModal(true)
      }

    } catch (error) {
      console.error('저장 처리 예외:', error)
      toast({
        variant: "destructive",
        title: "저장 실패",
        description: "예상치 못한 오류가 발생했습니다.",
      })
      setIsSaving(false)
    }
  }

  // 발행 확인 처리
  const handlePublishConfirm = async () => {
    console.log('발행 확인됨, handleSave 호출 중...')
    await handleSave(true, true) // force = true로 설정
  }

  // 예약 발행 처리 (시간대 문제 완전 해결)
  const handleSchedule = async () => {
    console.log('🔔 예약 발행 버튼이 클릭되었습니다!')
    console.log('📅 publishDate:', publishDate)
    console.log('⏰ publishTime:', publishTime)

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

    // ✅ 올바른 방법: ISO 문자열에 한국 시간대 명시
    const dateStr = format(publishDate, "yyyy-MM-dd")
    const koreaTimeISO = `${dateStr}T${publishTime}:00+09:00` // +09:00은 한국 시간대
    const scheduledDateTime = new Date(koreaTimeISO)
    
    console.log('🇰🇷 한국 시간 입력:', koreaTimeISO)
    console.log('🌍 UTC 자동 변환:', scheduledDateTime.toISOString())
    console.log('🕐 현재 UTC 시간:', new Date().toISOString())
    
    // 현재 시간과 비교 (둘 다 UTC 기준)
    const currentUtc = new Date()
    if (scheduledDateTime <= currentUtc) {
      console.log('❌ 예약 시간이 현재 시간보다 과거입니다.')
      
      toast({
        variant: "destructive",
        title: "예약 시간이 현재 시간보다 이후여야 합니다.",
        description: `현재 시간: ${format(new Date(), "MM/dd HH:mm")}`,
      })
      return
    }

    console.log('✅ 시간 검증 통과!')
    setIsSaving(true)
    
    try {
      // 필수 필드 검증
      if (!title.trim()) {
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

      console.log('✅ 필수 필드 검증 통과!')

      let finalThumbnailUrl = thumbnailUrl

      // 썸네일 파일이 있으면 업로드
      if (thumbnailFile) {
        console.log('📷 썸네일 업로드 시작...')
        try {
          const fileExt = thumbnailFile.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `thumbnails/${fileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('article-thumbnails')
            .upload(filePath, thumbnailFile, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('❌ 썸네일 업로드 오류:', uploadError)
            toast({
              variant: "destructive",
              title: "썸네일 업로드 실패",
              description: "썸네일 이미지 업로드 중 오류가 발생했습니다.",
            })
            setIsSaving(false)
            return
          }

          const { data: publicUrlData } = supabase.storage
            .from('article-thumbnails')
            .getPublicUrl(filePath)
          
          finalThumbnailUrl = publicUrlData.publicUrl
          console.log('✅ 썸네일 업로드 성공:', finalThumbnailUrl)
        } catch (uploadError) {
          console.error('❌ 썸네일 업로드 예외:', uploadError)
          toast({
            variant: "destructive",
            title: "썸네일 업로드 실패",
            description: "썸네일 이미지 업로드 중 예외가 발생했습니다.",
          })
          setIsSaving(false)
          return
        }
      }

      // 카테고리 ID 찾기
      const selectedCategory = categories.find(cat => cat.name === category)
      const categoryId = selectedCategory?.id

      if (!categoryId) {
        console.log('❌ 카테고리 ID를 찾을 수 없습니다.')
        toast({
          variant: "destructive",
          title: "카테고리 오류",
          description: "선택한 카테고리를 찾을 수 없습니다.",
        })
        setIsSaving(false)
        return
      }

      console.log('✅ 카테고리 ID 확인:', categoryId)

      // 기본 slug 생성
      const baseSlug = slug || title.toLowerCase()
        .replace(/[^a-z0-9가-힣\s]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      console.log('🔗 baseSlug 생성:', baseSlug)

      // 고유한 slug 생성
      const uniqueSlug = await generateUniqueSlug(baseSlug)
      console.log('🔗 uniqueSlug 생성:', uniqueSlug)

      // Article 데이터 준비 (예약 발행용)
      const articleData = {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        author: author || '픽틈 스포츠이슈팀',
        slug: uniqueSlug,
        status: 'scheduled',
        thumbnail: finalThumbnailUrl,
        seo_title: seoTitle || title,
        seo_description: seoDescription || '',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        published_at: scheduledDateTime.toISOString(), // 올바른 UTC 시간
        views: 0
      }

      console.log('📄 예약 발행 아티클 데이터:', JSON.stringify(articleData, null, 2))

      // Supabase에 아티클 저장
      console.log('💾 Supabase에 저장 시작...')
      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select()
        .single()

      if (error) {
        console.error('❌ 예약 발행 저장 오류:', error)
        
        if (error.code === '23505' && error.message.includes('articles_slug_key')) {
          toast({
            variant: "destructive",
            title: "URL 슬러그 중복",
            description: "유사한 제목의 글이 이미 존재합니다. 제목을 조금 수정해주세요.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "예약 발행 실패",
            description: `아티클 예약 발행 중 오류가 발생했습니다: ${error.message}`,
          })
        }
        
        setIsSaving(false)
        return
      }

      console.log('✅ 예약 발행 성공:', data)

      // 성공 토스트
      toast({
        title: "발행이 예약되었습니다.",
        description: `한국 시간 ${format(publishDate, "MM/dd")} ${publishTime}에 발행됩니다.`,
      })

      // 콘텐츠 관리 페이지로 이동
      console.log('🔄 1.5초 후 콘텐츠 관리 페이지로 이동합니다...')
      setTimeout(() => {
        router.push("/admin/posts")
      }, 1500)

    } catch (error) {
      console.error('❌ 예약 발행 처리 중 예외 발생:', error)
      toast({
        variant: "destructive",
        title: "예약 발행 실패",
        description: "예상치 못한 오류가 발생했습니다.",
      })
      setIsSaving(false)
    }
  }

  // 🔥 편집 상태를 임시 저장하는 함수
  const saveToLocalStorage = () => {
    const editData = {
      title,
      content,
      category,
      seoTitle,
      seoDescription,
      tags,
      slug,
      author,
      status,
      publishDate: publishDate?.toISOString(),
      publishTime,
      thumbnailUrl, // 🔥 실제 URL만 저장
      altText,
      timestamp: Date.now()
    }
    
    localStorage.setItem('pickteum_draft_new', JSON.stringify(editData))
    console.log('🔍 편집 상태 임시 저장됨')
  }

  // 🔥 localStorage에서 편집 상태 복원하는 함수
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('pickteum_draft_new')
      if (saved) {
        const editData = JSON.parse(saved)
        
        // 1시간 이내의 데이터만 복원
        if (Date.now() - editData.timestamp < 3600000) {
          setTitle(editData.title || '')
          setContent(editData.content || '')
          setCategory(editData.category || '')
          setSeoTitle(editData.seoTitle || '')
          setSeoDescription(editData.seoDescription || '')
          setTags(editData.tags || '')
          setSlug(editData.slug || '')
          setAuthor(editData.author || '픽틈 스포츠이슈팀')
          setStatus(editData.status || 'published')
          setPublishTime(editData.publishTime || '09:00')
          setThumbnailUrl(editData.thumbnailUrl || null) // 🔥 실제 URL 복원
          setAltText(editData.altText || '')
          
          if (editData.publishDate) {
            setPublishDate(new Date(editData.publishDate))
          }
          
          toast({
            title: "임시 저장된 데이터 복원",
            description: "이전에 작성 중이던 내용을 불러왔습니다.",
          })
        }
      }
    } catch (error) {
      console.error('localStorage 복원 오류:', error)
    }
  }

  // 🔥 페이지 로드 시 편집 상태 복원
  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  // 🔥 세션 스토리지를 사용한 안전한 미리보기 함수
  const handlePreview = () => {
    console.log('🔍 미리보기 버튼 클릭됨')
    
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

    console.log('🔍 필수 필드 검증 통과')

    try {
      // 🔥 현재 편집 상태 저장
      saveToLocalStorage()

      // 카테고리 색상 찾기
      const selectedCategory = categories.find(cat => cat.name === category)
      const categoryColor = selectedCategory?.color || '#cccccc'

      // 미리보기 데이터 준비
      const previewData = {
        title: title.trim(),
        content: content.trim(),
        category: category || '미분류',
        categoryColor,
        author: author || '픽틈',
        thumbnail: thumbnailUrl || null,
        publishDate: publishDate ? format(publishDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        publishTime: publishTime || '09:00',
        tags: tags || '',
        altText: altText || `${title} 썸네일`,
        returnUrl: window.location.pathname
      }

      console.log('🔍 미리보기 데이터 준비 완료:', previewData)

      // 🔥 세션 스토리지에 데이터 저장 (URL 길이 제한 해결)
      const previewId = `preview_${Date.now()}_${Math.random().toString(36).substring(2)}`
      sessionStorage.setItem(previewId, JSON.stringify(previewData))
      
      console.log('🔍 세션 스토리지 저장 완료:', previewId)

      // 🔥 미리보기 URL 생성 (간단한 ID만 전달)
      const previewUrl = `/admin/preview?id=${previewId}`
      
      console.log('🔍 미리보기 URL 생성:', previewUrl)

      // 미리보기 페이지로 이동
      router.push(previewUrl)

      console.log('🔍 미리보기 페이지로 이동 완료')

      toast({
        title: "미리보기",
        description: "미리보기 페이지로 이동합니다.",
      })

    } catch (error) {
      console.error('🔍 미리보기 오류:', error)
      
      toast({
        title: "미리보기 오류",
        description: `미리보기를 열 수 없습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      })
    }
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

                    <SelectItem value="published">발행</SelectItem>
                    <SelectItem value="scheduled">예약 발행</SelectItem>
                    <SelectItem value="draft">초안</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "scheduled" && (
                <div className="space-y-4 p-4 bg-blue-50/70 border border-blue-200/60 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="h-4 w-4" />
                    <Label className="text-sm font-medium">발행 일시 설정</Label>
                  </div>
                  
                  <div className="space-y-3">
                    {/* 날짜 선택 */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">발행 날짜</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-10 justify-start text-left font-normal bg-white hover:bg-gray-50 border-gray-200",
                              !publishDate && "text-muted-foreground",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {publishDate ? format(publishDate, "yyyy년 M월 d일", { locale: ko }) : "날짜 선택"}
                            </span>
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
                    </div>

                    {/* 시간 선택 */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-700">발행 시간</Label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 z-10"
                            >
                              <Clock className="h-4 w-4 text-gray-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-4" align="start">
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">시간 선택</Label>
                              <div className="grid grid-cols-2 gap-3">
                                {/* 시간 선택 */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600">시</Label>
                                  <Select 
                                    value={publishTime.split(':')[0]} 
                                    onValueChange={(hour) => {
                                      const minute = publishTime.split(':')[1] || '00'
                                      setPublishTime(`${hour.padStart(2, '0')}:${minute}`)
                                    }}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i.toString().padStart(2, '0')}시
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* 분 선택 */}
                                <div className="space-y-2">
                                  <Label className="text-xs text-gray-600">분</Label>
                                  <Select 
                                    value={publishTime.split(':')[1] || '00'} 
                                    onValueChange={(minute) => {
                                      const hour = publishTime.split(':')[0] || '00'
                                      setPublishTime(`${hour}:${minute.padStart(2, '0')}`)
                                    }}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 60 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                          {i.toString().padStart(2, '0')}분
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* 빠른 선택 버튼들 */}
                              <div className="space-y-2">
                                <Label className="text-xs text-gray-600">빠른 선택</Label>
                                <div className="grid grid-cols-3 gap-2">
                                  {['09:00', '12:00', '15:00', '18:00', '21:00', '00:00'].map((time) => (
                                    <Button
                                      key={time}
                                      variant="outline"
                                      size="sm"
                                      className="h-8 text-xs"
                                      onClick={() => setPublishTime(time)}
                                    >
                                      {time}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Input
                          type="text"
                          value={publishTime}
                          onChange={(e) => setPublishTime(e.target.value)}
                          placeholder="HH:MM"
                          className="pl-10 h-10 text-sm bg-white border-gray-200"
                        />
                      </div>
                    </div>

                    {/* 예약 정보 미리보기 */}
                    {publishDate && publishTime && (
                      <div className="p-3 bg-white border border-blue-100 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">예약 발행 시간:</span>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              {format(publishDate, "M월 d일", { locale: ko })} {publishTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 예약 설정 버튼 */}
                    <Button 
                      onClick={handleSchedule}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                      disabled={!publishDate || !publishTime}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      예약 발행 설정
                    </Button>
                  </div>
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
                  카테고리 선택 시 자동으로 해당 팀 작성자가 설정됩니다.
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
                {thumbnailPreview ? (
                  <div className="space-y-2">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-2 shadow-sm">
                      <Image
                        src={thumbnailPreview || "/placeholder.svg"}
                        alt="썸네일 미리보기"
                        fill
                        className="object-cover"
                      />
                      {/* 🔥 업로드 상태 표시 */}
                      {thumbnailUrl ? (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          ✓ 업로드 완료
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          업로드 중...
                        </div>
                      )}
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

              {/* 🔥 업로드 완료된 경우에만 alt 텍스트 표시 */}
              {thumbnailUrl && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="alt-text" className="flex items-center">
                      대체 텍스트 (ALT)
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                  </div>
                  <Input
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="이미지 설명 입력 (필수)"
                    className={!altText.trim() ? "border-red-300" : ""}
                  />
                  <p className="text-xs text-gray-500">
                    검색 엔진과 스크린 리더를 위한 이미지 설명 (필수 입력)
                  </p>
                  <p className="text-xs text-green-600">
                    ✓ 이미지가 성공적으로 업로드되었습니다.
                  </p>
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

      {/* Alt 텍스트 작성 팁 모달 */}
      <ImageAltTipsModal
        open={showAltTips}
        onOpenChange={setShowAltTips}
      />

      {/* 저장 완료 모달 */}
      <SaveConfirmModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        type="saved"
      />

      {/* 발행 확인 모달 */}
      <SaveConfirmModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
        type="publish-confirm"
        onConfirm={handlePublishConfirm}
        onCancel={() => setShowPublishModal(false)}
      />

      {/* 🔥 이미지 미리보기 모달 추가 */}
      <ImagePreviewModal
        open={showImagePreview}
        onOpenChange={(open) => {
          if (!open) {
            handleImageCancel()
          }
          setShowImagePreview(open)
        }}
        onConfirm={handleImageInsert}
        imageUrl={pendingImageUrl}
        fileName={pendingFileName}
      />
    </AdminLayout>
  )
}
