"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Grid2X2,
  List,
  Search,
  Upload,
  Filter,
  MoreHorizontal,
  Trash2,
  Download,
  Copy,
  ImageIcon,
  FileText,
  File,
  RefreshCw,
  X,
  Info,
  AlertCircle,
  Loader2,
  Folder,
  FolderOpen,
} from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import supabase from "@/lib/supabase"

// 타입 정의
interface MediaFile {
  id: string
  name: string
  type: string
  size: number
  dimensions?: string
  url: string
  path: string
  folder: string
  uploadedBy: string
  uploadedAt: string
  usedIn: string[]
  metadata?: {
    alt_text?: string
    [key: string]: unknown
  }
}

interface FolderInfo {
  name: string
  path: string
  fileCount: number
}

// 파일 크기 포맷팅 함수
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// 파일 아이콘 선택 함수
function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return <ImageIcon className="h-6 w-6 text-blue-500" />
  } else if (type.includes("pdf")) {
    return <FileText className="h-6 w-6 text-red-500" />
  } else if (type.includes("spreadsheet") || type.includes("excel") || type.includes("xlsx")) {
    return <FileText className="h-6 w-6 text-green-500" />
  } else if (type.includes("document") || type.includes("word") || type.includes("docx")) {
    return <FileText className="h-6 w-6 text-blue-500" />
  } else {
    return <File className="h-6 w-6 text-gray-500" />
  }
}

// 이미지 차원 정보를 URL에서 가져오는 함수 - 수정됨
const getImageDimensionsFromUrl = async (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new window.Image()
    const cleanup = () => {
      img.onload = null
      img.onerror = null
    }
    
    img.onload = () => {
      resolve(`${img.width}x${img.height}`)
      cleanup()
    }
    img.onerror = () => {
      resolve(null)
      cleanup()
    }
    img.src = url
  })
}

// 기존 getImageDimensions 함수도 수정
function getImageDimensions(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }
    
    const img = new window.Image() // HTMLImageElement 명시적 사용
    img.onload = () => {
      resolve(`${img.width}x${img.height}`)
      URL.revokeObjectURL(img.src) // 메모리 정리
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src) // 메모리 정리
      resolve(null)
    }
    img.src = URL.createObjectURL(file)
  })
}

// 아티클에서 사용된 이미지 확인하는 함수
async function getImageUsage(imageUrl: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('title, thumbnail')
      .or(`thumbnail.eq.${imageUrl},content.ilike.%${imageUrl}%`)
    
    if (error) {
      console.error('이미지 사용처 조회 오류:', error)
      return []
    }
    
    return data?.map(article => article.title) || []
  } catch (error) {
    console.error('이미지 사용처 조회 예외:', error)
    return []
  }
}

// 배치 처리로 성능 개선
const getAllImageUsages = async (imageUrls: string[]) => {
  const { data } = await supabase
    .from('articles')
    .select('title, thumbnail, content')
    
  const usageMap = new Map()
  data?.forEach(article => {
    imageUrls.forEach(url => {
      if (article.thumbnail === url || article.content?.includes(url)) {
        if (!usageMap.has(url)) usageMap.set(url, [])
        usageMap.get(url).push(article.title)
      }
    })
  })
  return usageMap
}

const handleStorageError = (error: any, context: string) => {
  const errorMessages = {
    'not valid JSON': 'Storage 접근 권한이 없습니다.',
    'bucket not found': '버킷을 찾을 수 없습니다.',
    'network error': '네트워크 연결을 확인해주세요.',
  }
  
  const matchedKey = Object.keys(errorMessages).find(key => 
    error.message?.includes(key)
  )
  const userMessage = matchedKey 
    ? errorMessages[matchedKey as keyof typeof errorMessages] 
    : '알 수 없는 오류가 발생했습니다.'
  
  console.error(`${context}:`, error)
  return userMessage
}

// alt 텍스트 관리 강화 - 임시 비활성화
// const updateImageAltText = async (filePath: string, altText: string) => {
//   // 파일 메타데이터에 alt 텍스트 저장
//   const { error } = await supabase.storage
//     .from('article-thumbnails')
//     .update(filePath, new File([], filePath), {
//       metadata: { alt_text: altText }
//     })
  
//   if (error) throw error
// }

// 이미지 최적화 정보 추가
const getImageOptimizationInfo = (file: MediaFile) => {
  const recommendations = []
  
  if (file.type.startsWith('image/')) {
    if (file.size > 500 * 1024) {
      recommendations.push('이미지 압축 권장 (500KB 이하)')
    }
    
    if (file.dimensions) {
      const [width, height] = file.dimensions.split('x').map(Number)
      if (width > 1920 || height > 1080) {
        recommendations.push('웹 최적화를 위해 크기 조정 권장')
      }
    }
  }
  
  return recommendations
}

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<FolderInfo[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>("all") // "all", "images", "thumbnails", etc.
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [uploaderFilter, setUploaderFilter] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFileDetails, setSelectedFileDetails] = useState<MediaFile | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 현재 사용자 정보 가져오기 함수 추가
  const getCurrentUser = (): string => {
    if (typeof window === 'undefined') return '시스템'
    
    const user = localStorage.getItem("pickteum_user") || 
                 sessionStorage.getItem("pickteum_user")
    
    return user || '알 수 없음'
  }

  // 이미지 사용처 확인 함수 - 에러 처리 개선
  const getImageUsage = async (imageUrl: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('title, thumbnail')
        .or(`thumbnail.eq.${imageUrl},content.ilike.%${imageUrl}%`)
      
      if (error) {
        console.error('이미지 사용처 조회 오류:', error)
        return []
      }
      
      return data?.map(article => article.title) || []
    } catch (error) {
      console.error('이미지 사용처 조회 예외:', error)
      return []
    }
  }

  // 미디어 파일 로드
  useEffect(() => {
    loadMediaFiles()
  }, [])

  // 재귀적으로 모든 폴더의 파일을 가져오는 함수 - 수정됨
  const loadFilesFromFolder = async (folderPath: string = ''): Promise<MediaFile[]> => {
    try {
      console.log(`폴더 조회 시작: "${folderPath}"`)

      // Storage API 호출 시 에러 처리 강화
      const { data: files, error } = await supabase.storage
        .from('article-thumbnails')
        .list(folderPath, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error(`폴더 ${folderPath} 조회 오류:`, error)
        
        // 특정 오류 타입에 따른 처리
        const userMessage = handleStorageError(error, `폴더 ${folderPath} 로드 실패`)
        throw new Error(userMessage)
      }

      if (!files) {
        console.log(`폴더 ${folderPath}에 파일이 없습니다.`)
        return []
      }

      console.log(`폴더 ${folderPath}에서 ${files.length}개 항목 발견`)

      const mediaFiles: MediaFile[] = []
      const subFolders: string[] = []

      for (const file of files) {
        try {
          // 폴더인 경우 (metadata가 null이고 확장자가 없는 경우)
        if (!file.metadata && file.name && !file.name.includes('.')) {
            const subFolderPath = folderPath ? `${folderPath}/${file.name}` : file.name
            subFolders.push(subFolderPath)
            console.log(`하위 폴더 발견: ${subFolderPath}`)
          continue
        }

          // 파일인 경우 (metadata가 있는 경우)
          if (file.metadata && file.name) {
            const filePath = folderPath ? `${folderPath}/${file.name}` : file.name
            
            // 공개 URL 가져오기 - 에러 처리 추가
            const { data: urlData } = supabase.storage
              .from('article-thumbnails')
              .getPublicUrl(filePath)
            
            if (!urlData?.publicUrl) {
              console.error(`파일 ${filePath}의 공개 URL을 가져올 수 없습니다.`)
              continue
            }
            
            const publicUrl = urlData.publicUrl

            // 이미지 사용처 확인 (비동기 처리 최적화)
            let usedIn: string[] = []
            try {
              usedIn = await getImageUsage(publicUrl)
            } catch (error) {
              console.warn(`파일 ${filePath}의 사용처 확인 실패:`, error)
            }

            // 이미지 차원 정보 (조건부 처리)
            let dimensions: string | undefined
            if (file.metadata?.mimetype?.startsWith('image/')) {
              try {
              dimensions = await getImageDimensionsFromUrl(publicUrl) || undefined
              } catch (error) {
                console.warn(`파일 ${filePath}의 차원 정보 가져오기 실패:`, error)
              }
            }

            const mediaFile: MediaFile = {
              id: filePath,
              name: file.name,
              type: file.metadata?.mimetype || 'application/octet-stream',
              size: file.metadata?.size || 0,
              dimensions,
              url: publicUrl,
              path: filePath,
              folder: folderPath || 'root',
              uploadedBy: getCurrentUser(),
              uploadedAt: file.created_at || file.updated_at || new Date().toISOString(),
              usedIn,
              metadata: file.metadata
            }

            mediaFiles.push(mediaFile)
            console.log(`파일 처리 완료: ${filePath}`)
          }
        } catch (fileError) {
          console.error(`파일 ${file.name} 처리 중 오류:`, fileError)
          continue // 개별 파일 오류는 건너뛰고 계속 진행
        }
      }

      // 하위 폴더들도 재귀적으로 처리 (병렬 처리로 성능 개선)
      if (subFolders.length > 0) {
        console.log(`${subFolders.length}개 하위 폴더 처리 시작`)
        
        const subFolderPromises = subFolders.map(subFolder => 
          loadFilesFromFolder(subFolder).catch(error => {
            console.error(`하위 폴더 ${subFolder} 처리 실패:`, error)
            return [] // 실패한 폴더는 빈 배열 반환
        })
      )

        const subFolderResults = await Promise.all(subFolderPromises)
        subFolderResults.forEach(subFolderFiles => {
          mediaFiles.push(...subFolderFiles)
        })
      }

      console.log(`폴더 ${folderPath} 처리 완료: ${mediaFiles.length}개 파일`)
      return mediaFiles

    } catch (error) {
      console.error(`폴더 ${folderPath} 로드 실패:`, error)
      
      // 사용자에게 친화적인 오류 메시지
      const userMessage = handleStorageError(error, `폴더 ${folderPath} 로드 실패`)
      throw new Error(userMessage)
    }
  }

  // 폴더 정보 수집
  const collectFolderInfo = (files: MediaFile[]): FolderInfo[] => {
    const folderMap = new Map<string, number>()
    
    files.forEach(file => {
      const folder = file.folder
      folderMap.set(folder, (folderMap.get(folder) || 0) + 1)
    })

    const folderInfos: FolderInfo[] = []
    folderMap.forEach((count, folderName) => {
      folderInfos.push({
        name: folderName === 'root' ? '루트' : folderName,
        path: folderName,
        fileCount: count
      })
    })

    return folderInfos.sort((a, b) => a.name.localeCompare(b.name))
  }

  const loadMediaFiles = async () => {
    try {
      setIsLoading(true)
      setIsError(false)

      console.log('모든 폴더에서 파일 로드 시작...')
      
      // Storage 버킷 접근 권한 확인
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage
          .getBucket('article-thumbnails')
        
        if (bucketError) {
          console.warn('버킷 정보 확인 실패:', bucketError)
          // 버킷 정보 확인 실패해도 계속 진행 (권한 문제일 수 있음)
        } else {
          console.log('버킷 확인 완료:', bucketData)
        }
      } catch (bucketCheckError) {
        console.warn('버킷 확인 중 예외:', bucketCheckError)
      }
      
      // 모든 폴더의 파일을 재귀적으로 로드
      const allFiles = await loadFilesFromFolder('')
      
      console.log('로드된 전체 파일:', allFiles.length)

      // 폴더 정보 수집
      const folderInfos = collectFolderInfo(allFiles)
      
      setMedia(allFiles)
      setFolders(folderInfos)
      
      toast({
        title: "미디어 파일 로드 완료",
        description: `${allFiles.length}개의 파일을 ${folderInfos.length}개 폴더에서 불러왔습니다.`,
      })

    } catch (error) {
      console.error('미디어 파일 로드 실패:', error)
      setIsError(true)
      
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      
      toast({
        variant: "destructive",
        title: "미디어 파일 로드 실패",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 필터링된 미디어
  const filteredMedia = media.filter((item) => {
    // 폴더 필터
    if (selectedFolder !== "all" && item.folder !== selectedFolder) {
      return false
    }

    // 검색어 필터
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // 타입 필터
    if (typeFilter && typeFilter !== "all") {
      if (typeFilter === "image" && !item.type.startsWith("image/")) return false
      if (typeFilter === "document" && !item.type.includes("pdf") && !item.type.includes("document")) return false
      if (typeFilter === "spreadsheet" && !item.type.includes("spreadsheet") && !item.type.includes("excel")) return false
    }

    // 업로더 필터
    if (uploaderFilter && uploaderFilter !== "all" && item.uploadedBy !== uploaderFilter) {
      return false
    }

    // 날짜 범위 필터
    if (dateRange?.from || dateRange?.to) {
      const itemDate = new Date(item.uploadedAt)
      if (dateRange.from && itemDate < dateRange.from) return false
      if (dateRange.to && itemDate > dateRange.to) return false
    }

    // 탭 필터
    if (activeTab !== "all") {
      if (activeTab === "images" && !item.type.startsWith("image/")) return false
      if (activeTab === "documents" && !item.type.includes("pdf") && !item.type.includes("document")) return false
    }

    return true
  })

  // 전체 선택 토글
  const toggleSelectAll = () => {
    if (selectedMedia.length === filteredMedia.length && filteredMedia.length > 0) {
      setSelectedMedia([])
    } else {
      setSelectedMedia(filteredMedia.map((item) => item.id))
    }
  }

  // 개별 선택 토글
  const toggleSelect = (id: string) => {
    setSelectedMedia((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // 선택된 파일 삭제
  const deleteSelected = async () => {
    if (!window.confirm(`선택된 ${selectedMedia.length}개 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const filesToDelete = media.filter(file => selectedMedia.includes(file.id))
      
      // 파일들 삭제
      const deletePromises = filesToDelete.map(async (file) => {
        const { error } = await supabase.storage
          .from('article-thumbnails')
          .remove([file.path])
        
        if (error) {
          console.error(`파일 삭제 오류 (${file.name}):`, error)
          throw error
        }
        return file
      })

      await Promise.all(deletePromises)

      // 로컬 상태 업데이트
      setMedia(prev => prev.filter(file => !selectedMedia.includes(file.id)))
      setSelectedMedia([])

      toast({
        title: "삭제 완료",
        description: `${filesToDelete.length}개 파일이 삭제되었습니다.`,
      })

    } catch (error) {
      console.error('파일 삭제 실패:', error)
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: "파일 삭제 중 오류가 발생했습니다.",
      })
    }
  }

  // 필터 초기화
  const resetFilters = () => {
    setSearchTerm("")
    setTypeFilter(null)
    setUploaderFilter(null)
    setDateRange(undefined)
    setActiveTab("all")
    setShowFilters(false)

    toast({
      title: "필터 초기화",
      description: "모든 필터가 초기화되었습니다.",
    })
  }

  // 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      
      // 파일 크기 검증 (10MB 제한)
      const oversizedFiles = filesArray.filter(file => file.size > 10 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        toast({
          variant: "destructive",
          title: "파일 크기 초과",
          description: `파일 크기는 10MB를 초과할 수 없습니다: ${oversizedFiles.map(f => f.name).join(', ')}`,
        })
        return
      }

      setUploadFiles(filesArray)
    }
  }

  // 실제 업로드 처리
  const startUpload = async () => {
    if (uploadFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "파일을 선택해주세요",
        description: "업로드할 파일이 선택되지 않았습니다.",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadedFiles: MediaFile[] = []

      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        
        setUploadProgress(Math.round((i / uploadFiles.length) * 90))

        try {
          // 파일 타입에 따라 폴더 결정
          const isImage = file.type.startsWith('image/')
          const targetFolder = isImage ? 'images' : 'thumbnails'
          
          // 파일명 생성 (중복 방지)
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `${targetFolder}/${fileName}`
          
          // 파일 업로드
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('article-thumbnails')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error(`파일 업로드 오류 (${file.name}):`, uploadError)
            throw uploadError
          }

          // 공개 URL 가져오기
          const { data: urlData } = supabase.storage
            .from('article-thumbnails')
            .getPublicUrl(filePath)
          
          // 이미지 차원 가져오기
          const dimensions = await getImageDimensions(file)

          // 새 미디어 파일 객체 생성
          const newMediaFile: MediaFile = {
            id: filePath,
            name: file.name,
            type: file.type,
            size: file.size,
            dimensions: dimensions || undefined,
            url: urlData.publicUrl,
            path: filePath,
            folder: targetFolder,
            uploadedBy: getCurrentUser(),
            uploadedAt: new Date().toISOString(),
            usedIn: [],
            metadata: {
              originalName: file.name,
              uploadedAt: new Date().toISOString()
            }
          }

          uploadedFiles.push(newMediaFile)

        } catch (error) {
          console.error(`파일 업로드 실패 (${file.name}):`, error)
          toast({
            variant: "destructive",
            title: `업로드 실패: ${file.name}`,
            description: "파일 업로드 중 오류가 발생했습니다.",
          })
        }
      }

      setUploadProgress(100)

      // 로컬 상태 업데이트
      setMedia(prev => [...uploadedFiles, ...prev])
      
      // 폴더 정보 업데이트
      const updatedFolders = collectFolderInfo([...uploadedFiles, ...media])
      setFolders(updatedFolders)

      setTimeout(() => {
        setIsUploading(false)
        setUploadFiles([])
        setShowUploadDialog(false)
        setUploadProgress(0)

        toast({
          title: "업로드 완료",
          description: `${uploadedFiles.length}개 파일이 업로드되었습니다.`,
        })
      }, 500)

    } catch (error) {
      console.error('업로드 처리 실패:', error)
      setIsUploading(false)
      toast({
        variant: "destructive",
        title: "업로드 실패",
        description: "파일 업로드 중 예상치 못한 오류가 발생했습니다.",
      })
    }
  }

  // 개별 파일 삭제
  const deleteFile = async (file: MediaFile) => {
    if (!window.confirm(`"${file.name}"을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      const { error } = await supabase.storage
        .from('article-thumbnails')
        .remove([file.path])

      if (error) {
        console.error('파일 삭제 오류:', error)
        throw error
      }

      // 로컬 상태 업데이트
      setMedia(prev => prev.filter(f => f.id !== file.id))
      setSelectedFileDetails(null)

      toast({
        title: "삭제 완료",
        description: "파일이 삭제되었습니다.",
      })

    } catch (error) {
      console.error('파일 삭제 실패:', error)
      toast({
        variant: "destructive",
        title: "삭제 실패",
        description: "파일 삭제 중 오류가 발생했습니다.",
      })
    }
  }

  // 파일 상세 정보 표시
  const showFileDetails = (file: MediaFile) => {
    setSelectedFileDetails(file)
  }

  // 파일 URL 복사
  const copyFileUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL 복사됨",
        description: "파일 URL이 클립보드에 복사되었습니다.",
      })
    })
  }

  // 파일 다운로드
  const downloadFile = (file: MediaFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 키보드 네비게이션 지원
  const handleKeyDown = (e: React.KeyboardEvent, fileId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      showFileDetails(media.find(f => f.id === fileId)!)
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-[120px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  // 에러 상태
  if (isError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">미디어 파일 로드 실패</h3>
          <p className="text-gray-500 mb-4">Storage에서 파일 목록을 불러오는 중 오류가 발생했습니다.</p>
          <Button variant="outline" onClick={loadMediaFiles}>
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
        </div>
      </AdminLayout>
    )
  }

  // 타입별 카운트
  const typeCounts = {
    all: media.length,
    images: media.filter((item) => item.type.startsWith("image/")).length,
    documents: media.filter((item) => item.type.includes("pdf") || item.type.includes("document")).length,
  }

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">미디어 라이브러리</h1>
          <p className="text-sm text-gray-500">Supabase Storage에서 모든 미디어 파일을 관리할 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadMediaFiles}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            className="bg-[#FFC83D] hover:bg-[#FFB800] shadow-sm transition-all"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="mr-2 h-4 w-4" /> 파일 업로드
          </Button>
        </div>
      </div>

      {/* 폴더 선택 탭 추가 */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs value={selectedFolder} onValueChange={setSelectedFolder} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                전체 ({media.length})
              </TabsTrigger>
              {folders.map((folder) => (
                <TabsTrigger
                  key={folder.path}
                  value={folder.path}
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  {folder.name} ({folder.fileCount})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 기존 타입별 탭 */}
      <Card className="mb-6">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                전체 ({filteredMedia.length})
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                이미지 ({filteredMedia.filter(item => item.type.startsWith("image/")).length})
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-[#FFC83D] data-[state=active]:bg-transparent"
              >
                문서 ({filteredMedia.filter(item => item.type.includes("pdf") || item.type.includes("document")).length})
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
            placeholder="파일명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            className={showFilters ? "bg-[#FFC83D] hover:bg-[#FFB800]" : ""}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" /> 필터
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-gray-100" : ""}
          >
            <Grid2X2 size={18} />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-gray-100" : ""}
          >
            <List size={18} />
          </Button>

          {(showFilters || typeFilter || uploaderFilter || dateRange) && (
            <Button
              variant="outline"
              size="icon"
              onClick={resetFilters}
              title="필터 초기화"
              className="hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <RefreshCw size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* 확장된 필터 */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">파일 유형</label>
              <Select value={typeFilter || ""} onValueChange={(value) => setTypeFilter(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="모든 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 유형</SelectItem>
                  <SelectItem value="image">이미지</SelectItem>
                  <SelectItem value="document">문서</SelectItem>
                  <SelectItem value="spreadsheet">스프레드시트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">업로더</label>
              <Select value={uploaderFilter || ""} onValueChange={(value) => setUploaderFilter(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="모든 업로더" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 업로더</SelectItem>
                  <SelectItem value="현재사용자">현재사용자</SelectItem>
                  <SelectItem value="시스템">시스템</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">업로드 날짜</label>
              <DateRangePicker date={dateRange} onDateChange={setDateRange} locale={ko} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
              <X className="mr-2 h-4 w-4" /> 필터 닫기
            </Button>
          </div>
        </div>
      )}

      {/* 선택된 항목 액션 */}
      {selectedMedia.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-md flex flex-wrap items-center mb-4 gap-2 border border-amber-200 shadow-sm">
          <span className="text-sm font-medium text-amber-800 mr-4">{selectedMedia.length}개 항목 선택됨</span>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={deleteSelected} 
              className="h-8"
            >
              <Trash2 className="mr-1 h-4 w-4" /> 삭제
            </Button>
          </div>
        </div>
      )}

      {/* 미디어 그리드/리스트 뷰 */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-md border">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">
            {media.length === 0 ? "업로드된 파일이 없습니다." : "검색 결과가 없습니다."}
          </p>
          {media.length === 0 ? (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setShowUploadDialog(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              첫 번째 파일 업로드하기
            </Button>
          ) : (
            <Button variant="link" className="mt-2" onClick={resetFilters}>
              필터 초기화하기
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className={`relative group border rounded-md overflow-hidden bg-white transition-all hover:shadow-md ${
                selectedMedia.includes(item.id) ? "ring-2 ring-[#FFC83D]" : ""
              }`}
            >
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedMedia.includes(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="bg-white/90 border-gray-400"
                />
              </div>

              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => showFileDetails(item)}>
                      <Info className="mr-2 h-4 w-4" /> 상세 정보
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyFileUrl(item.url)}>
                      <Copy className="mr-2 h-4 w-4" /> URL 복사
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadFile(item)}>
                      <Download className="mr-2 h-4 w-4" /> 다운로드
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => deleteFile(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> 삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div
                role="button"
                tabIndex={0}
                aria-label={`${item.name} 파일 상세 정보 보기`}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className="aspect-square cursor-pointer"
                onClick={() => showFileDetails(item)}
              >
                {item.type.startsWith("image/") ? (
                  <Image src={item.url || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    {getFileIcon(item.type)}
                    <span className="mt-2 text-xs text-center text-gray-500 truncate w-full">{item.name}</span>
                  </div>
                )}
              </div>

              <div className="p-2 border-t bg-white">
                <p className="text-xs font-medium truncate" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-md border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"
                >
                  <Checkbox
                    checked={selectedMedia.length === filteredMedia.length && filteredMedia.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  파일명
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  유형
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  크기
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  업로더
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  업로드 날짜
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  사용처
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                >
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedia.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Checkbox checked={selectedMedia.includes(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {item.type.startsWith("image/") ? (
                          <Image
                            src={item.url || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                            {getFileIcon(item.type)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={item.name}>
                          {item.name}
                        </p>
                        {item.dimensions && <p className="text-xs text-gray-500">{item.dimensions}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className="font-normal">
                      {item.type.split("/")[1] || item.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatFileSize(item.size)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.uploadedBy}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(item.uploadedAt), "yyyy-MM-dd")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.usedIn.length > 0 ? (
                      <span className="text-xs">{item.usedIn.length}개 콘텐츠</span>
                    ) : (
                      <span className="text-xs text-gray-400">미사용</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => showFileDetails(item)}>
                          <Info className="mr-2 h-4 w-4" /> 상세 정보
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyFileUrl(item.url)}>
                          <Copy className="mr-2 h-4 w-4" /> URL 복사
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadFile(item)}>
                          <Download className="mr-2 h-4 w-4" /> 다운로드
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteFile(item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 파일 업로드 다이얼로그 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>파일 업로드</DialogTitle>
            <DialogDescription>
              Supabase Storage에 이미지, 문서 등의 파일을 업로드할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isUploading ? (
              <>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">파일을 드래그하거나 클릭하여 업로드</p>
                    <p className="text-xs text-gray-400 mt-1">최대 10MB, JPG, PNG, PDF, DOCX, XLSX 등</p>
                  </div>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={handleFileUpload}
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  />
                </div>

                {uploadFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">선택된 파일 ({uploadFiles.length})</h4>
                    <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                      {uploadFiles.map((file, index) => (
                        <div key={index} className="flex items-center p-2 text-sm">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                          )}
                          <div className="truncate flex-1">{file.name}</div>
                          <div className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatFileSize(file.size)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>업로드 중...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#FFC83D] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">{uploadFiles.length}개 파일 업로드 중...</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {!isUploading ? (
              <>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  취소
                </Button>
                <Button 
                  onClick={startUpload} 
                  className="bg-[#FFC83D] hover:bg-[#FFB800]"
                  disabled={uploadFiles.length === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  업로드
                </Button>
              </>
            ) : (
              <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                업로드 중...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 파일 상세 정보 다이얼로그 */}
      <Dialog open={!!selectedFileDetails} onOpenChange={(open) => !open && setSelectedFileDetails(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>파일 상세 정보</DialogTitle>
          </DialogHeader>

          {selectedFileDetails && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-md p-2 flex items-center justify-center">
                {selectedFileDetails.type.startsWith("image/") ? (
                  <div className="relative w-full aspect-square max-h-60">
                    <Image
                      src={selectedFileDetails.url || "/placeholder.svg"}
                      alt={selectedFileDetails.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 flex flex-col items-center justify-center">
                    {getFileIcon(selectedFileDetails.type)}
                    <span className="mt-2 text-sm text-gray-500 text-center break-all">
                      {selectedFileDetails.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">파일명</h3>
                  <p className="text-sm break-all">{selectedFileDetails.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">유형</h3>
                  <p className="text-sm">{selectedFileDetails.type}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">크기</h3>
                  <p className="text-sm">{formatFileSize(selectedFileDetails.size)}</p>
                </div>

                {selectedFileDetails.dimensions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">이미지 크기</h3>
                    <p className="text-sm">{selectedFileDetails.dimensions}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">업로드 날짜</h3>
                  <p className="text-sm">
                    {format(new Date(selectedFileDetails.uploadedAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">업로더</h3>
                  <p className="text-sm">{selectedFileDetails.uploadedBy}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Storage 경로</h3>
                  <p className="text-xs text-gray-400 break-all">{selectedFileDetails.path}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">사용처</h3>
                  {selectedFileDetails.usedIn.length > 0 ? (
                    <ul className="text-sm list-disc list-inside space-y-1">
                      {selectedFileDetails.usedIn.map((item, index) => (
                        <li key={index} className="truncate" title={item}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">사용된 콘텐츠가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2 w-full justify-between">
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (selectedFileDetails) {
                    deleteFile(selectedFileDetails)
                  }
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> 삭제
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedFileDetails) {
                      copyFileUrl(selectedFileDetails.url)
                    }
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> URL 복사
                </Button>
                <Button 
                  className="bg-[#FFC83D] hover:bg-[#FFB800]"
                  onClick={() => {
                    if (selectedFileDetails) {
                      downloadFile(selectedFileDetails)
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> 다운로드
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
