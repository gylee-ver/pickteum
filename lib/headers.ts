/**
 * 헤더 설정 일괄 관리 유틸리티
 * - Google AdSense 및 Search Console 최적화
 * - 환경별 헤더 설정 관리
 * - SEO 및 성능 최적화 헤더
 */

export interface SecurityHeaders {
  'Content-Security-Policy'?: string
  'X-Frame-Options'?: string
  'Cross-Origin-Opener-Policy'?: string
  'Cross-Origin-Embedder-Policy'?: string
  'Origin-Agent-Cluster'?: string
  'X-Content-Type-Options'?: string
  'Referrer-Policy'?: string
  'Strict-Transport-Security'?: string
  'X-DNS-Prefetch-Control'?: string
  'X-XSS-Protection'?: string
  [key: string]: string | undefined
}

export interface PerformanceHeaders {
  'Cache-Control'?: string
  'ETag'?: string
  'Last-Modified'?: string
  'Vary'?: string
  [key: string]: string | undefined
}

export interface SEOHeaders {
  'Link'?: string
  'X-Robots-Tag'?: string
  [key: string]: string | undefined
}

export type AllHeaders = SecurityHeaders & PerformanceHeaders & SEOHeaders

/**
 * Google AdSense 호환 보안 헤더 설정
 * - 애드센스 미리보기 도구 및 광고 표시를 위한 최적화
 * - 크로스 오리진 정책 완화
 */
export function getAdSenseCompatibleHeaders(): SecurityHeaders {
  return {
    // Google AdSense 도메인 허용을 위한 CSP 설정
    'Content-Security-Policy': [
      "frame-ancestors 'self'",
      "https://*.google.com",
      "https://*.googleads.com", 
      "https://*.googlesyndication.com",
      "https://*.doubleclick.net",
      "https://*.gstatic.com"
    ].join(' '),
    
    // iframe 호환을 위한 프레임 정책
    'X-Frame-Options': 'ALLOWALL',
    
    // 크로스 오리진 정책 완화 (AdSense 호환성)
    'Cross-Origin-Opener-Policy': 'unsafe-none',
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Origin-Agent-Cluster': '?0',
    
    // 기본 보안 헤더 유지
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    
    // XSS 보호
    'X-XSS-Protection': '1; mode=block'
  }
}

/**
 * 프로덕션 환경 추가 보안 헤더
 * - HTTPS 강제 및 DNS 프리페치 제어
 */
export function getProductionSecurityHeaders(): SecurityHeaders {
  const baseHeaders = getAdSenseCompatibleHeaders()
  
  return {
    ...baseHeaders,
    // HTTPS 강제 (프로덕션만)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // DNS 프리페치 제어
    'X-DNS-Prefetch-Control': 'on'
  }
}

/**
 * 정적 리소스용 캐시 헤더
 * - 이미지, CSS, JS 등의 캐싱 최적화
 */
export function getStaticResourceHeaders(): PerformanceHeaders {
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Vary': 'Accept-Encoding'
  }
}

/**
 * 동적 페이지용 캐시 헤더
 * - ISR 및 동적 콘텐츠 캐싱
 */
export function getDynamicPageHeaders(revalidateSeconds: number = 300): PerformanceHeaders {
  return {
    'Cache-Control': `public, s-maxage=${revalidateSeconds}, stale-while-revalidate=${revalidateSeconds * 2}`,
    'Vary': 'Accept-Encoding, Accept'
  }
}

/**
 * SEO 최적화 헤더
 * - 검색 엔진 크롤링 및 색인 최적화
 */
export function getSEOHeaders(canonical?: string): SEOHeaders {
  const headers: SEOHeaders = {
    'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  }
  
  if (canonical) {
    headers['Link'] = `<${canonical}>; rel="canonical"`
  }
  
  return headers
}

/**
 * API 엔드포인트용 헤더
 * - CORS 및 API 캐싱 설정
 */
export function getAPIHeaders(): AllHeaders {
  return {
    ...getAdSenseCompatibleHeaders(),
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'Vary': 'Accept-Encoding, Accept'
  }
}

/**
 * 환경에 따른 헤더 설정 반환
 */
export function getEnvironmentHeaders(): SecurityHeaders {
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (isProduction) {
    return getProductionSecurityHeaders()
  }
  
  return getAdSenseCompatibleHeaders()
}

/**
 * 헤더 객체를 NextResponse에 적용하는 헬퍼 함수
 */
export function applyHeaders(response: Response, headers: Record<string, string | undefined>): Response {
  Object.entries(headers).forEach(([key, value]) => {
    if (value !== undefined) {
      response.headers.set(key, value)
    }
  })
  return response
}

/**
 * 헤더 검증 함수 (CI용)
 */
export function validateHeaders(headers: Record<string, string>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 필수 보안 헤더 체크
  const requiredHeaders = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy'
  ]
  
  requiredHeaders.forEach(header => {
    if (!headers[header]) {
      errors.push(`Missing required header: ${header}`)
    }
  })
  
  // AdSense 호환성 체크
  if (headers['Cross-Origin-Opener-Policy'] !== 'unsafe-none') {
    errors.push('Cross-Origin-Opener-Policy should be "unsafe-none" for AdSense compatibility')
  }
  
  if (headers['Cross-Origin-Embedder-Policy'] !== 'unsafe-none') {
    errors.push('Cross-Origin-Embedder-Policy should be "unsafe-none" for AdSense compatibility')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}