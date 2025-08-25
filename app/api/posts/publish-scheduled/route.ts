import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils'
import { supabaseServer } from '@/lib/data'

// 서버 키 사용: lib/data의 supabaseServer 활용

export async function POST(request: NextRequest) {

  try {
    logger.log('🕐 예약 발행 체크 시작:', new Date().toISOString())
    
    // 현재 시간 (UTC)
    const now = new Date().toISOString()
    
    // 예약된 상태이면서 발행 시간이 현재 시간보다 과거인 글들 조회
    const { data: scheduledArticles, error: fetchError } = await supabaseServer
      .from('articles')
      .select('id, title, published_at')
      .eq('status', 'scheduled')
      .lte('published_at', now)
      .not('published_at', 'is', null)

    if (fetchError) {
      logger.error('예약된 글 조회 오류:', fetchError)
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message 
      }, { status: 500 })
    }

    if (!scheduledArticles || scheduledArticles.length === 0) {
      logger.log('📝 발행할 예약된 글이 없습니다.')
      return NextResponse.json({ 
        success: true, 
        message: '발행할 예약된 글이 없습니다.',
        publishedCount: 0 
      })
    }

    logger.log(`📚 발행 대상 글 ${scheduledArticles.length}개 발견:`)
    scheduledArticles.forEach(article => {
      logger.log(`- ${article.title} (예약 시간: ${article.published_at})`)
    })

    // 예약된 글들을 발행 상태로 변경
    const articleIds = scheduledArticles.map(article => article.id)
    
    const { data: updatedArticles, error: updateError } = await supabaseServer
      .from('articles')
      .update({ 
        status: 'published',
        updated_at: new Date().toISOString()
      })
      .in('id', articleIds)
      .select('id, title, published_at')

    if (updateError) {
      logger.error('글 발행 오류:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: updateError.message 
      }, { status: 500 })
    }

    logger.log(`✅ ${updatedArticles?.length || 0}개 글이 성공적으로 발행되었습니다.`)
    updatedArticles?.forEach(article => {
      logger.log(`- 발행됨: ${article.title}`)
    })

    return NextResponse.json({ 
      success: true, 
      message: `${updatedArticles?.length || 0}개 글이 성공적으로 발행되었습니다.`,
      publishedCount: updatedArticles?.length || 0,
      publishedArticles: updatedArticles
    })

  } catch (error) {
    logger.error('예약 발행 처리 중 예외 발생:', error)
    return NextResponse.json({ 
      success: false, 
      error: '예상치 못한 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}

// GET 요청도 지원 (테스트용)
export async function GET() {
  try {
    const now = new Date().toISOString()
    
    logger.log('🕐 예약 발행 체크 시작:', new Date().toISOString())
    
    // 현재 시간보다 이전에 예약된 글들 조회
    const { data: scheduledArticles, error: fetchError } = await supabaseServer
      .from('articles')
      .select('id, title, published_at')
      .eq('status', 'scheduled')
      .lte('published_at', now)
      .order('published_at', { ascending: true })
    
    if (fetchError) {
      logger.error('예약된 글 조회 오류:', fetchError)
      return NextResponse.json({ 
        error: '예약된 글 조회 실패', 
        details: fetchError.message 
      }, { status: 500 })
    }
    
    if (!scheduledArticles || scheduledArticles.length === 0) {
      logger.log('📝 발행할 예약된 글이 없습니다.')
      return NextResponse.json({ 
        message: '발행할 예약된 글이 없습니다',
        publishedCount: 0 
      })
    }
    
    logger.log(`📚 발행 대상 글 ${scheduledArticles.length}개 발견:`)
    scheduledArticles.forEach(article => {
      logger.log(`- ${article.title} (예약 시간: ${article.published_at})`)
    })
    
    // 글들을 published 상태로 변경
    const articleIds = scheduledArticles.map(article => article.id)
    
    const { data: updatedArticles, error: updateError } = await supabaseServer
      .from('articles')
      .update({ 
        status: 'published',
        published_at: now  // 실제 발행 시간으로 업데이트
      })
      .in('id', articleIds)
      .select('id, title')
    
    if (updateError) {
      logger.error('글 발행 오류:', updateError)
      return NextResponse.json({ 
        error: '글 발행 실패', 
        details: updateError.message 
      }, { status: 500 })
    }
    
    logger.log(`✅ ${updatedArticles?.length || 0}개 글이 성공적으로 발행되었습니다.`)
    updatedArticles?.forEach(article => {
      logger.log(`- 발행됨: ${article.title}`)
    })
    
    return NextResponse.json({
      message: '예약된 글이 성공적으로 발행되었습니다',
      publishedCount: updatedArticles?.length || 0,
      publishedArticles: updatedArticles
    })
    
  } catch (error) {
    logger.error('예약 발행 처리 중 예외 발생:', error)
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 })
  }
} 