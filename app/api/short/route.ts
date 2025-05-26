// URL 단축 API
import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { logger } from '@/lib/utils'

// 6자리 랜덤 코드 생성 (숫자 + 영문자)
function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 고유한 단축 코드 생성 (중복 체크)
async function generateUniqueShortCode(): Promise<string> {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const code = generateShortCode()
    
    logger.log(`단축 코드 생성 시도 ${attempts + 1}:`, code)
    
    const { data, error } = await supabase
      .from('articles')
      .select('short_code')
      .eq('short_code', code)
      .single()
    
    logger.log('중복 체크 결과:', { code, found: !!data, error: error?.code })
    
    if (error && error.code === 'PGRST116') {
      logger.log('고유한 코드 생성 성공:', code)
      return code
    }
    
    attempts++
  }
  
  throw new Error('고유한 단축 코드 생성에 실패했습니다')
}

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json()
    
    logger.log('단축 URL 생성 요청:', { articleId })
    
    if (!articleId) {
      return NextResponse.json({ error: '아티클 ID가 필요합니다' }, { status: 400 })
    }
    
    // 아티클 확인
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, short_code, status, title')
      .eq('id', articleId)
      .eq('status', 'published')
      .single()
    
    logger.log('아티클 조회 결과:', {
      found: !!article,
      error: articleError?.message,
      existingShortCode: article?.short_code,
      title: article?.title?.substring(0, 50)
    })
    
    if (articleError || !article) {
      return NextResponse.json({ error: '아티클을 찾을 수 없습니다' }, { status: 404 })
    }
    
    let shortCode: string
    
    if (article.short_code) {
      logger.log('기존 short_code 사용:', article.short_code)
      shortCode = article.short_code
    } else {
      logger.log('새로운 short_code 생성 중...')
      shortCode = await generateUniqueShortCode()
      
      logger.log('생성된 short_code DB 업데이트 중:', shortCode)
      
      const { error: updateError } = await supabase
        .from('articles')
        .update({ short_code: shortCode })
        .eq('id', articleId)
      
      if (updateError) {
        logger.error('short_code 업데이트 오류:', updateError)
        return NextResponse.json({ error: '단축 URL 생성에 실패했습니다' }, { status: 500 })
      }
      
      logger.log('short_code DB 업데이트 성공:', shortCode)
      
      // 업데이트 검증
      const { data: verification } = await supabase
        .from('articles')
        .select('short_code')
        .eq('id', articleId)
        .single()
      
      logger.log('업데이트 검증:', {
        expected: shortCode,
        actual: verification?.short_code,
        match: verification?.short_code === shortCode
      })
    }
    
    const host = request.headers.get('host') || 'pickteum.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const shortUrl = `${protocol}://${host}/s/${shortCode}`
    
    logger.log('단축 URL 생성 완료:', {
      shortCode,
      shortUrl,
      articleId,
      host,
      protocol
    })
    
    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl: `${protocol}://${host}/article/${articleId}`,
      title: article.title
    })
    
  } catch (error) {
    logger.error('URL 단축 치명적 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
} 