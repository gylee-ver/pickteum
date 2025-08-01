import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

// 🔥 관리자에서 기사 게시 시 캐시 무효화를 위한 API
export async function POST(request: NextRequest) {
  try {
    const { type, articleId, path } = await request.json()

    // 간단한 인증 (실제 환경에서는 더 강력한 인증 필요)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (type) {
      case 'article':
        if (!articleId) {
          return NextResponse.json({ error: 'Article ID required' }, { status: 400 })
        }
        
        // 🔥 기사별 캐시 무효화
        revalidateTag(`article:${articleId}`)
        revalidateTag('articles:all')
        
        console.log(`🔄 기사 캐시 무효화: article:${articleId}`)
        break

      case 'path':
        if (!path) {
          return NextResponse.json({ error: 'Path required' }, { status: 400 })
        }
        
        // 🔥 특정 경로 캐시 무효화
        revalidatePath(path)
        
        console.log(`🔄 경로 캐시 무효화: ${path}`)
        break

      case 'home':
        // 🔥 홈페이지 캐시 무효화
        revalidatePath('/')
        revalidateTag('articles:all')
        
        console.log('🔄 홈페이지 캐시 무효화')
        break

      case 'category':
        const { categoryName } = await request.json()
        if (!categoryName) {
          return NextResponse.json({ error: 'Category name required' }, { status: 400 })
        }
        
        // 🔥 카테고리별 캐시 무효화
        revalidatePath(`/category/${categoryName}`)
        revalidateTag('articles:all')
        
        console.log(`🔄 카테고리 캐시 무효화: ${categoryName}`)
        break

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('캐시 무효화 오류:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}

// 🔥 GET 요청으로도 경로별 무효화 지원 (개발/테스트용)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const secret = searchParams.get('secret')
    const path = searchParams.get('path')
    const tag = searchParams.get('tag')

    // 시크릿 키 확인
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (path) {
      revalidatePath(path)
      console.log(`🔄 경로 캐시 무효화: ${path}`)
    }

    if (tag) {
      revalidateTag(tag)
      console.log(`🔄 태그 캐시 무효화: ${tag}`)
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      path,
      tag,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('캐시 무효화 오류:', error)
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}