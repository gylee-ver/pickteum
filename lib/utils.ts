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

// 이미지 URL 생성 유틸리티
export function getImageUrl(thumbnail: string | null, bucket = 'article-thumbnails'): string {
  if (!thumbnail) return '/placeholder.svg'
  
  if (thumbnail.startsWith('http')) {
    return thumbnail
  }
  
  if (thumbnail.startsWith('/')) {
    return `${APP_CONFIG.BASE_URL}${thumbnail}`
  }
  
  return `${APP_CONFIG.SUPABASE_STORAGE_URL}/${bucket}/${thumbnail}`
}
