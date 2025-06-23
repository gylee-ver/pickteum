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
      // 🔥 Supabase에서 리다이렉트 규칙 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/redirects?from_url=eq.${pathname}&select=to_url`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
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
      // 에러 발생 시 정상 처리 계속
    }
  }
  
  // 🔥 단축 URL 패턴 체크 (/s/code)
  const shortUrlMatch = pathname.match(/^\/s\/([^\/]+)$/)
  if (shortUrlMatch) {
    const code = shortUrlMatch[1]
    
    try {
      // 🔥 Supabase에서 리다이렉트 규칙 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (supabaseUrl && supabaseKey) {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/redirects?from_url=eq.${pathname}&select=to_url`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
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
      // 에러 발생 시 정상 처리 계속
    }
  }
  
  return NextResponse.next()
}

// 🔥 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    '/article/:path*',
    '/s/:path*'
  ]
} 