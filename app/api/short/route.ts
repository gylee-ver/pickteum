// URL 단축 API
import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

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
    
    // articles 테이블에서 중복 체크
    const { data, error } = await supabase
      .from('articles')
      .select('short_code')
      .eq('short_code', code)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // 데이터가 없으면 (중복이 아니면) 이 코드 사용
      return code
    }
    
    attempts++
  }
  
  throw new Error('고유한 단축 코드 생성에 실패했습니다')
}

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json()
    
    if (!articleId) {
      return NextResponse.json({ error: '아티클 ID가 필요합니다' }, { status: 400 })
    }
    
    // 아티클 정보와 기존 short_code 확인
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, short_code, status, title')
      .eq('id', articleId)
      .eq('status', 'published')
      .single()
    
    if (articleError || !article) {
      return NextResponse.json({ error: '아티클을 찾을 수 없습니다' }, { status: 404 })
    }
    
    let shortCode: string
    
    if (article.short_code) {
      // 기존 short_code가 있으면 사용
      shortCode = article.short_code
    } else {
      // short_code가 없으면 새로 생성
      shortCode = await generateUniqueShortCode()
      
      // articles 테이블에 short_code 업데이트
      const { error: updateError } = await supabase
        .from('articles')
        .update({ short_code: shortCode })
        .eq('id', articleId)
      
      if (updateError) {
        console.error('short_code 업데이트 오류:', updateError)
        return NextResponse.json({ error: '단축 URL 생성에 실패했습니다' }, { status: 500 })
      }
    }
    
    // 현재 호스트 정보 가져오기
    const host = request.headers.get('host') || 'pickteum.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    
    // 단축 URL 생성
    const shortUrl = `${protocol}://${host}/s/${shortCode}`
    
    return NextResponse.json({
      shortUrl,
      shortCode,
      originalUrl: `${protocol}://${host}/article/${articleId}`,
      title: article.title
    })
    
  } catch (error) {
    console.error('URL 단축 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
} 