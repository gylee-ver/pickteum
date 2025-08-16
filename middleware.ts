import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 🔥 SEO 최적화: 게시글 삭제/비공개 시 301 리다이렉트 처리
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 🔥 아티클 URL 패턴 체크 (/article/uuid)
  const articleMatch = pathname.match(/^\/article\/([a-f0-9-]{36})$/)
  if (articleMatch) {
    const articleId = articleMatch[1]
    
    try {
      // 🔥 Supabase에서 리다이렉트 규칙 확인 (애드센스 호환성을 위한 타임아웃 추가)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        // 🔥 애드센스 미리보기 도구 호환성을 위한 타임아웃 설정
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2초 타임아웃
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/redirects?from_url=eq.${pathname}&select=to_url`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        )
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const redirects = await response.json()
          if (redirects && redirects.length > 0) {
            const redirectTo = redirects[0].to_url
            // 🔥 무한 루프 방지
            if (redirectTo && redirectTo !== pathname) {
              return NextResponse.redirect(new URL(redirectTo, request.url), 301)
            }
          }
        }
      }
    } catch (error) {
      console.error('Redirect middleware error:', error)
      // 🔥 애드센스 호환성: 에러 발생 시에도 정상 처리 계속 (타임아웃, 네트워크 오류 등)
    }
  }
  
  // 🔥 단축 URL 패턴 체크 (/s/code)
  const shortUrlMatch = pathname.match(/^\/s\/([^\/]+)$/)
  if (shortUrlMatch) {
    const code = shortUrlMatch[1]
    
    try {
      // 🔥 Supabase에서 리다이렉트 규칙 확인 (애드센스 호환성을 위한 타임아웃 추가)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        // 🔥 애드센스 미리보기 도구 호환성을 위한 타임아웃 설정
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2초 타임아웃
        
        const response = await fetch(
          `${supabaseUrl}/rest/v1/redirects?from_url=eq.${pathname}&select=to_url`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        )
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const redirects = await response.json()
          if (redirects && redirects.length > 0) {
            const redirectTo = redirects[0].to_url
            // 🔥 무한 루프 방지
            if (redirectTo && redirectTo !== pathname) {
              return NextResponse.redirect(new URL(redirectTo, request.url), 301)
            }
          }
        }
      }
    } catch (error) {
      console.error('Short URL redirect middleware error:', error)
      // 🔥 애드센스 호환성: 에러 발생 시에도 정상 처리 계속 (타임아웃, 네트워크 오류 등)
    }
  }

  // 🔥 헤더 설정 적용 (Edge Runtime 호환)
  const response = NextResponse.next()
  
  // 🔥 프레임 임베드 정책: X-Frame-Options 대신 CSP frame-ancestors로 화이트리스트 허용
  // Google 도구(미리보기/광고)에서만 임베드를 허용하고, 일반 임의 임베드는 차단
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.google.com https://*.googleads.com https://*.googlesyndication.com https://*.doubleclick.net https://*.gstatic.com"
  )
  response.headers.set('Cross-Origin-Opener-Policy', 'unsafe-none')
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none')
  response.headers.set('Origin-Agent-Cluster', '?0')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // 🔥 캐시 및 성능 헤더
  if (pathname.startsWith('/api/')) {
    // API 엔드포인트용 캐시 헤더
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    response.headers.set('Vary', 'Accept-Encoding, Accept')
  } else if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2)$/)) {
    // 정적 리소스용 장기 캐시
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    response.headers.set('Vary', 'Accept-Encoding')
  } else {
    // 일반 페이지용 캐시 (ISR 호환)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('Vary', 'Accept-Encoding, Accept')
  }
  
  // SEO 최적화 헤더
  response.headers.set('X-Robots-Tag', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
  
  return response
}

// 🔥 미들웨어 적용 경로 설정 - 모든 페이지에 보안 헤더 적용
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
} 