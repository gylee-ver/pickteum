import { NextRequest, NextResponse } from 'next/server'

// 환경 변수 체크
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: NextRequest) {
  // 환경 변수가 없으면 에러 대신 경고 반환
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다.')
    return NextResponse.json({ 
      success: false, 
      error: 'Supabase configuration missing',
      message: '환경 변수를 확인해주세요.' 
    }, { status: 500 })
  }

  try {
    // Supabase 클라이언트를 동적으로 생성
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🕐 예약 발행 체크 시작:', new Date().toISOString())
    
    // 현재 시간 (UTC)
    const now = new Date().toISOString()
    
    // 예약된 상태이면서 발행 시간이 현재 시간보다 과거인 글들 조회
    const { data: scheduledArticles, error: fetchError } = await supabase
      .from('articles')
      .select('id, title, published_at')
      .eq('status', 'scheduled')
      .lte('published_at', now)
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
        updated_at: new Date().toISOString()
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