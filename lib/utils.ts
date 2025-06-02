import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 환경 변수 및 상수 관리
export const APP_CONFIG = {
  BASE_URL: 'https://www.pickteum.com',
  SUPABASE_STORAGE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
    : 'https://jpdjalmsoooztqvhuzyx.supabase.co/storage/v1/object/public',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const

// 안전한 로깅 함수
export const logger = {
  log: (...args: any[]) => {
    if (APP_CONFIG.IS_DEVELOPMENT) {
      console.log(...args)
    }
  },
  error: (...args: any[]) => {
    console.error(...args)
  },
  warn: (...args: any[]) => {
    if (APP_CONFIG.IS_DEVELOPMENT) {
      console.warn(...args)
    }
  }
}

// 이미지 URL 생성 유틸리티 - Base64 지원 + 안전한 로깅
export function getImageUrl(thumbnail: string | null, bucket = 'article-thumbnails'): string {
  // 안전한 로깅 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    try {
      // eslint-disable-next-line no-console
      console.log('🖼️ getImageUrl 호출:', thumbnail)
    } catch {
      // 로깅 실패해도 계속 진행
    }
  }
  
  // null 또는 빈 문자열 처리
  if (!thumbnail || thumbnail.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      try {
        // eslint-disable-next-line no-console
        console.log('📝 썸네일이 없어 placeholder 사용')
      } catch {
        // 로깅 실패해도 계속 진행
      }
    }
    return '/placeholder.svg'
  }
  
  // 🔥 Base64 데이터인 경우 (data:image/로 시작)
  if (thumbnail.startsWith('data:image/')) {
    if (process.env.NODE_ENV === 'development') {
      try {
        // eslint-disable-next-line no-console
        console.log('📸 Base64 이미지 데이터 직접 사용')
      } catch {
        // 로깅 실패해도 계속 진행
      }
    }
    return thumbnail
  }
  
  // 이미 완전한 HTTP URL인 경우 (새로 업로드된 이미지)
  if (thumbnail.startsWith('http')) {
    if (process.env.NODE_ENV === 'development') {
      try {
        // eslint-disable-next-line no-console
        console.log('🌐 완전한 URL 사용:', thumbnail)
      } catch {
        // 로깅 실패해도 계속 진행
      }
    }
    return thumbnail
  }
  
  // 절대 경로인 경우 (기존 방식)
  if (thumbnail.startsWith('/')) {
    const url = `${APP_CONFIG.BASE_URL}${thumbnail}`
    if (process.env.NODE_ENV === 'development') {
      try {
        // eslint-disable-next-line no-console
        console.log('📁 절대 경로 URL 변환:', url)
      } catch {
        // 로깅 실패해도 계속 진행
      }
    }
    return url
  }
  
  // 상대 경로인 경우 Supabase Storage URL 생성
  const finalUrl = `${APP_CONFIG.SUPABASE_STORAGE_URL}/${bucket}/${thumbnail}`
  if (process.env.NODE_ENV === 'development') {
    try {
      // eslint-disable-next-line no-console
      console.log('☁️ Storage URL 생성:', finalUrl)
    } catch {
      // 로깅 실패해도 계속 진행
    }
  }
  return finalUrl
}

// 이미지 URL 유효성 검사
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
