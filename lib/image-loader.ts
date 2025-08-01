import { APP_CONFIG } from './utils'

export interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

/**
 * Next.js Image 컴포넌트용 커스텀 로더
 * Supabase Storage와 외부 이미지 URL을 처리합니다.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // Base64 데이터 URL인 경우 그대로 반환
  if (src.startsWith('data:image/')) {
    return src
  }

  // 이미 최적화된 외부 서비스 URL인 경우
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', (quality || 75).toString())
    url.searchParams.set('fm', 'webp')
    url.searchParams.set('fit', 'crop')
    url.searchParams.set('crop', 'center')
    return url.toString()
  }

  // Supabase Storage URL인 경우 - 리사이징 및 최적화 적용
  if (src.includes('jpdjalmsoooztqvhuzyx.supabase.co/storage/v1/object/public/')) {
    const url = new URL(src)
    
    // Supabase Storage 이미지 변환 파라미터 추가
    // https://supabase.com/docs/guides/storage/serving/image-transformations
    url.searchParams.set('width', width.toString())
    url.searchParams.set('quality', (quality || 75).toString())
    url.searchParams.set('format', 'webp')
    url.searchParams.set('resize', 'contain')
    
    return url.toString()
  }

  // 로컬 도메인 이미지인 경우
  if (src.startsWith('/') || src.includes(APP_CONFIG.BASE_URL)) {
    const baseUrl = src.startsWith('/') ? `${APP_CONFIG.BASE_URL}${src}` : src
    
    // 정적 파일의 경우 원본 반환 (SVG, placeholder 등)
    if (src.includes('placeholder') || src.endsWith('.svg')) {
      return baseUrl
    }
    
    // 기타 이미지는 기본 크기 파라미터 추가 (향후 CDN 연동 대비)
    const url = new URL(baseUrl)
    url.searchParams.set('w', width.toString())
    if (quality && quality !== 75) {
      url.searchParams.set('q', quality.toString())
    }
    return url.toString()
  }

  // 기타 외부 URL인 경우 원본 반환
  return src
}

/**
 * blur placeholder용 저화질 이미지 URL 생성
 */
export function generateBlurDataURL(src: string): string {
  if (!src || src.startsWith('data:image/') || src.includes('placeholder')) {
    // 기본 blur placeholder
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBAUREiExQVFhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyugDKgSAASSccNqggjcElbOQp1XASQF1bgKs7Q2f8A/9k="
  }
  
  // Supabase Storage 이미지의 경우 10px 저화질 버전 생성
  if (src.includes('jpdjalmsoooztqvhuzyx.supabase.co/storage/v1/object/public/')) {
    const url = new URL(src)
    url.searchParams.set('width', '10')
    url.searchParams.set('quality', '20')
    url.searchParams.set('format', 'webp')
    url.searchParams.set('blur', '5')
    return url.toString()
  }
  
  // Unsplash 이미지의 경우
  if (src.includes('images.unsplash.com')) {
    const url = new URL(src)
    url.searchParams.set('w', '10')
    url.searchParams.set('q', '20')
    url.searchParams.set('blur', '5')
    return url.toString()
  }
  
  // 기타 경우 기본 blur 반환
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAhEQACAQIHAQAAAAAAAAAAAAABAgADBAUREiExQVFhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyugDKgSAASSccNqggjcElbOQp1XASQF1bgKs7Q2f8A/9k="
}