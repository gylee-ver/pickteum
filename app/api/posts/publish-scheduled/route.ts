import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

// 예약된 글들을 자동으로 발행하는 API
export async function POST(request: NextRequest) {
  try {
    console.log('🕐 예약 발행 체크 시작:', new Date().toISOString())
    
    // 현재 시간 (UTC)
    const now = new Date().toISOString()
    
    // 예약된 상태이면서 발행 시간이 현재 시간보다 과거인 글들 조회
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, published_at')
      .eq('status', 'scheduled')
      .lte('published_at', now) // published_at이 현재 시간보다 과거
      .not('published_at', 'is', null)

    if (fetchError) {
      console.error('예약된 글 조회 오류:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      }, { status: 500 })
    }

    if (!scheduledArticles || scheduledArticles.length === 0) {
      console.log('📝 발행할 예약된 글이 없습니다.')
      return NextResponse.json({ 
        success: true, 
        message: '발행할 예약된 글이 없습니다.',
        publishedCount: 0 
      })
    }

    console.log(`📚 발행 대상 글 ${scheduledArticles.length}개 발견:`)
    scheduledArticles.forEach(article => {
      console.log(`- ${article.title} (예약 시간: ${article.published_at})`)
    })

    // 예약된 글들을 발행 상태로 변경
    const articleIds = scheduledArticles.map(article => article.id)
    
    const { data: updatedArticles, error: updateError } = await supabase
      .from('articles')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString() // 수정 시간 업데이트
      })
      .in('id', articleIds)
      .select('id, title, published_at')

    if (updateError) {
      console.error('글 발행 오류:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 500 })
    }

    console.log(`✅ ${updatedArticles?.length || 0}개 글이 성공적으로 발행되었습니다.`)
    updatedArticles?.forEach(article => {
      console.log(`- 발행됨: ${article.title}`)
    })

    return NextResponse.json({ 
      success: true, 
      message: `${updatedArticles?.length || 0}개 글이 성공적으로 발행되었습니다.`,
      publishedCount: updatedArticles?.length || 0,
      publishedArticles: updatedArticles
    })

  } catch (error) {
    console.error('예약 발행 처리 중 예외 발생:', error)
    return NextResponse.json({ 
      success: false, 
      error: '예상치 못한 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

// GET 요청도 지원 (테스트용)
export async function GET() {
  return POST(new NextRequest('http://localhost:3000/api/posts/publish-scheduled', { method: 'POST' }))
} 