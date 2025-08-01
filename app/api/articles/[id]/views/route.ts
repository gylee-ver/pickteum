import { NextRequest, NextResponse } from 'next/server'
import { updateArticleViews } from '@/lib/data'

// Edge runtime 제거 - Supabase 호환성을 위해 Node.js runtime 사용

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('조회수 업데이트 API 호출됨')
    
    const resolvedParams = await params
    const { id } = resolvedParams
    
    console.log('아티클 ID:', id)
    
    if (!id) {
      console.error('아티클 ID 누락')
      return NextResponse.json(
        { error: 'Article ID is required' }, 
        { status: 400 }
      )
    }

    console.log('updateArticleViews 함수 호출 시작')
    const success = await updateArticleViews(id)
    console.log('updateArticleViews 함수 호출 결과:', success)
    
    if (success) {
      console.log('조회수 업데이트 성공')
      return NextResponse.json({ success: true })
    } else {
      // 조회수 업데이트 실패해도 사용자 경험에 영향 없도록 200으로 응답
      console.warn('조회수 업데이트 실패 (백그라운드)')
      return NextResponse.json({ 
        success: false, 
        message: 'View count update failed but request completed',
        silent: true 
      })
    }
    
  } catch (error) {
    console.error('조회수 업데이트 API 예외:', error)
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    // 예외 발생해도 사용자 경험에 영향 없도록 200으로 응답
    return NextResponse.json({ 
      success: false, 
      message: 'View count update failed due to exception',
      silent: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}